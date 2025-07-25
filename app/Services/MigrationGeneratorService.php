<?php

namespace App\Services;

use App\Models\MigrationGenerator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MigrationGeneratorService
{
    /**
     * Sanitize SQL input to prevent malicious code injection.
     */
    public function sanitizeSqlInput(string $sql): string
    {
        // Remove dangerous SQL commands
        $dangerousPatterns = [
            '/\b(DROP\s+DATABASE|TRUNCATE|DELETE\s+FROM|UPDATE\s+.*\s+SET)\b/i',
            '/\b(GRANT|REVOKE|ALTER\s+USER|CREATE\s+USER)\b/i',
            '/\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b/i',
            '/\b(EXEC|EXECUTE|xp_cmdshell)\b/i',
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $sql)) {
                throw new \InvalidArgumentException('SQL contains potentially dangerous commands');
            }
        }

        // Basic SQL injection protection
        $sql = preg_replace('/--.*$/m', '', $sql); // Remove SQL comments
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Remove multi-line comments

        return trim($sql);
    }

    /**
     * Generate Laravel migration from SQL CREATE TABLE statement.
     */
    public function generateMigration(string $name, string $sql): string
    {
        $className = 'Create' . Str::studly($name) . 'Table';
        $tableName = $this->extractTableName($sql);

        if (!$tableName) {
            throw new \InvalidArgumentException('Could not extract table name from SQL');
        }

        $columns = $this->parseColumns($sql);

        // Debug: Log if no columns found
        if (empty($columns)) {
            Log::warning('No columns parsed from SQL', [
                'sql' => $sql,
                'table_name' => $tableName
            ]);
            throw new \InvalidArgumentException('No columns could be parsed from the SQL CREATE TABLE statement');
        }

        $indexes = $this->parseIndexes($sql);
        $foreignKeys = $this->parseForeignKeys($sql);

        $migrationContent = $this->buildMigrationContent(
            $className,
            $tableName,
            $columns,
            $indexes,
            $foreignKeys
        );

        return $migrationContent;
    }

    /**
     * Extract table name from CREATE TABLE statement.
     */
    private function extractTableName(string $sql): ?string
    {
        if (preg_match('/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s*\(/i', $sql, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Parse columns from SQL CREATE TABLE statement.
     */
    private function parseColumns(string $sql): array
    {
        $columns = [];

        // Debug: Log the SQL being parsed
        Log::info('Parsing SQL for columns', ['sql' => $sql]);

        // Extract the content inside parentheses - improved regex to handle various formats
        $pattern = '/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?[^`\s()]+`?\s*\((.*)\)(?:\s*[;]?\s*(?:ENGINE|CHARSET|COLLATE|AUTO_INCREMENT|COMMENT|$))/is';

        if (!preg_match($pattern, $sql, $matches)) {
            Log::warning('Failed to match CREATE TABLE pattern', [
                'sql' => $sql,
                'pattern' => $pattern
            ]);
            return $columns;
        }

        $tableContent = trim($matches[1]);
        Log::info('Extracted table content', ['content' => $tableContent]);

        // Split by comma, but be careful with commas inside parentheses
        $lines = $this->splitTableContent($tableContent);
        Log::info('Split into lines', ['lines' => $lines]);

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip empty lines
            if (empty($line)) {
                continue;
            }

            Log::info('Processing line', ['line' => $line]);

            // Skip constraints, indexes, etc.
            if (preg_match('/^\s*(PRIMARY\s+KEY|KEY|INDEX|UNIQUE|FOREIGN\s+KEY|CONSTRAINT)/i', $line)) {
                Log::info('Skipping constraint/index line', ['line' => $line]);
                continue;
            }

            $column = $this->parseColumnDefinition($line);
            if ($column) {
                Log::info('Parsed column', ['column' => $column]);
                $columns[] = $column;
            } else {
                Log::warning('Failed to parse column', ['line' => $line]);
            }
        }

        Log::info('Final parsed columns', ['columns' => $columns]);
        return $columns;
    }

    /**
     * Split table content by commas, respecting parentheses and quotes
     */
    private function splitTableContent(string $content): array
    {
        $lines = [];
        $currentLine = '';
        $parenDepth = 0;
        $inQuotes = false;
        $quoteChar = '';

        Log::info('Splitting table content', ['content' => $content]);

        for ($i = 0; $i < strlen($content); $i++) {
            $char = $content[$i];

            // Handle quotes
            if (($char === '"' || $char === "'" || $char === '`') && !$inQuotes) {
                $inQuotes = true;
                $quoteChar = $char;
                $currentLine .= $char;
            } elseif ($char === $quoteChar && $inQuotes) {
                // Check if it's escaped
                if ($i > 0 && $content[$i - 1] === '\\') {
                    $currentLine .= $char;
                } else {
                    $inQuotes = false;
                    $quoteChar = '';
                    $currentLine .= $char;
                }
            } elseif ($inQuotes) {
                $currentLine .= $char;
            } elseif ($char === '(') {
                $parenDepth++;
                $currentLine .= $char;
            } elseif ($char === ')') {
                $parenDepth--;
                $currentLine .= $char;
            } elseif ($char === ',' && $parenDepth === 0) {
                // Split here
                $trimmedLine = trim($currentLine);
                if (!empty($trimmedLine)) {
                    $lines[] = $trimmedLine;
                }
                $currentLine = '';
            } else {
                $currentLine .= $char;
            }
        }

        // Add the last line
        $trimmedLine = trim($currentLine);
        if (!empty($trimmedLine)) {
            $lines[] = $trimmedLine;
        }

        Log::info('Split result', ['lines' => $lines]);
        return $lines;
    }

    /**
     * Parse individual column definition.
     */
    private function parseColumnDefinition(string $line): ?array
    {
        // Remove backticks and normalize spacing
        $originalLine = $line;
        $line = preg_replace('/`([^`]+)`/', '$1', $line);
        $line = preg_replace('/\s+/', ' ', trim($line));

        Log::info('Parsing column definition', [
            'original' => $originalLine,
            'normalized' => $line
        ]);

        // Match column name and type with optional parameters
        $pattern = '/^([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z]+)(\([^)]*\))?(.*)$/i';

        if (!preg_match($pattern, $line, $matches)) {
            Log::warning('Column definition did not match pattern', [
                'line' => $line,
                'pattern' => $pattern
            ]);
            return null;
        }

        $columnName = $matches[1];
        $dataType = strtolower($matches[2]);
        $typeParams = $matches[3] ?? '';
        $attributes = $matches[4] ?? '';

        Log::info('Column parts extracted', [
            'name' => $columnName,
            'type' => $dataType,
            'params' => $typeParams,
            'attributes' => $attributes
        ]);

        // Handle type size parameters (like bigint(20))
        if (empty($typeParams) && preg_match('/^([a-zA-Z]+)\(([^)]+)\)(.*)$/i', $matches[2] . $typeParams, $typeMatches)) {
            $dataType = strtolower($typeMatches[1]);
            $typeParams = '(' . $typeMatches[2] . ')';
            $attributes = $typeMatches[3] . ' ' . $attributes;
        }

        $attributesLower = strtolower($attributes);

        // Check for primary key in attributes
        $isPrimary = str_contains($attributesLower, 'primary key') || str_contains($attributesLower, 'primary');
        $isAutoIncrement = str_contains($attributesLower, 'auto_increment');
        $isUnsigned = str_contains($attributesLower, 'unsigned');

        // Determine if column is nullable
        $isNullable = true; // Default to nullable
        if (str_contains($attributesLower, 'not null')) {
            $isNullable = false;
        } elseif (str_contains($attributesLower, 'null')) {
            $isNullable = true;
        }

        $default = $this->extractDefault($attributes);
        $comment = $this->extractComment($attributes);

        $column = [
            'name' => $columnName,
            'type' => $this->mapSqlTypeToLaravel($dataType, $typeParams, $isUnsigned),
            'nullable' => $isNullable,
            'default' => $default,
            'auto_increment' => $isAutoIncrement,
            'primary' => $isPrimary,
            'unique' => str_contains($attributesLower, 'unique'),
            'unsigned' => $isUnsigned,
            'comment' => $comment,
        ];

        Log::info('Final column parsed', ['column' => $column]);
        return $column;
    }

    /**
     * Map MySQL data types to Laravel migration methods.
     */
    private function mapSqlTypeToLaravel(string $sqlType, string $params = '', bool $isUnsigned = false): array
    {
        $type = ['method' => 'string', 'params' => []];

        switch ($sqlType) {
            case 'int':
            case 'integer':
                $type['method'] = $isUnsigned ? 'unsignedInteger' : 'integer';
                break;
            case 'bigint':
                $type['method'] = $isUnsigned ? 'unsignedBigInteger' : 'bigInteger';
                break;
            case 'smallint':
                $type['method'] = $isUnsigned ? 'unsignedSmallInteger' : 'smallInteger';
                break;
            case 'tinyint':
                // Check if it's boolean (tinyint(1))
                if ($params === '(1)') {
                    $type['method'] = 'boolean';
                } else {
                    $type['method'] = $isUnsigned ? 'unsignedTinyInteger' : 'tinyInteger';
                }
                break;
            case 'varchar':
                $type['method'] = 'string';
                if (preg_match('/\((\d+)\)/', $params, $matches)) {
                    $type['params'][] = (int)$matches[1];
                }
                break;
            case 'char':
                $type['method'] = 'char';
                if (preg_match('/\((\d+)\)/', $params, $matches)) {
                    $type['params'][] = (int)$matches[1];
                }
                break;
            case 'text':
                $type['method'] = 'text';
                break;
            case 'longtext':
                $type['method'] = 'longText';
                break;
            case 'mediumtext':
                $type['method'] = 'mediumText';
                break;
            case 'decimal':
            case 'numeric':
                $type['method'] = $isUnsigned ? 'unsignedDecimal' : 'decimal';
                if (preg_match('/\((\d+),\s*(\d+)\)/', $params, $matches)) {
                    $type['params'] = [(int)$matches[1], (int)$matches[2]];
                } elseif (preg_match('/\((\d+)\)/', $params, $matches)) {
                    // If only precision is specified, default scale to 0
                    $type['params'] = [(int)$matches[1], 0];
                }
                break;
            case 'float':
                $type['method'] = $isUnsigned ? 'unsignedFloat' : 'float';
                break;
            case 'double':
                $type['method'] = $isUnsigned ? 'unsignedDouble' : 'double';
                break;
            case 'datetime':
                $type['method'] = 'dateTime';
                break;
            case 'timestamp':
                $type['method'] = 'timestamp';
                break;
            case 'date':
                $type['method'] = 'date';
                break;
            case 'time':
                $type['method'] = 'time';
                break;
            case 'json':
                $type['method'] = 'json';
                break;
            case 'enum':
                $type['method'] = 'enum';
                if (preg_match('/\((.*)\)/', $params, $matches)) {
                    $enumValues = array_map(
                        fn($val) => trim($val, " '\""),
                        explode(',', $matches[1])
                    );
                    $type['params'] = [$enumValues];
                }
                break;
        }

        return $type;
    }

    /**
     * Extract default value from column attributes.
     */
    private function extractDefault(string $attributes): ?string
    {
        // Match DEFAULT with various quote styles and values
        if (preg_match('/default\s+([\'"]?)([^\s,\'";]+)\1/i', $attributes, $matches)) {
            $default = trim($matches[2]);
            return $default === 'null' ? null : $default;
        }

        // Handle DEFAULT without quotes for keywords like NULL, CURRENT_TIMESTAMP, etc.
        if (preg_match('/default\s+(null|current_timestamp|now\(\))/i', $attributes, $matches)) {
            $default = strtolower(trim($matches[1]));
            return $default === 'null' ? null : $default;
        }

        return null;
    }

    /**
     * Extract comment from column attributes.
     */
    private function extractComment(string $attributes): ?string
    {
        // Match comment with single or double quotes, case insensitive
        if (preg_match('/comment\s*=\s*[\'"]([^\'"]*)[\'\"]/i', $attributes, $matches)) {
            return $matches[1];
        }
        // Also handle comment without equals sign
        if (preg_match('/comment\s+[\'"]([^\'"]*)[\'\"]/i', $attributes, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Parse indexes from SQL.
     */
    private function parseIndexes(string $sql): array
    {
        $indexes = [];

        // Parse PRIMARY KEY
        if (preg_match('/PRIMARY\s+KEY\s*\(([^)]+)\)/i', $sql, $matches)) {
            $columns = array_map('trim', explode(',', $matches[1]));
            $columns = array_map(fn($col) => trim($col, '`'), $columns);
            $indexes[] = ['type' => 'primary', 'columns' => $columns];
        }

        // Parse regular indexes
        if (preg_match_all('/(?:KEY|INDEX)\s+`?([^`\s]+)`?\s*\(([^)]+)\)/i', $sql, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $name = $match[1];
                $columns = array_map('trim', explode(',', $match[2]));
                $columns = array_map(fn($col) => trim($col, '`'), $columns);
                $indexes[] = ['type' => 'index', 'name' => $name, 'columns' => $columns];
            }
        }

        // Parse UNIQUE indexes
        if (preg_match_all('/UNIQUE\s+(?:KEY\s+)?`?([^`\s]+)`?\s*\(([^)]+)\)/i', $sql, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $name = $match[1];
                $columns = array_map('trim', explode(',', $match[2]));
                $columns = array_map(fn($col) => trim($col, '`'), $columns);
                $indexes[] = ['type' => 'unique', 'name' => $name, 'columns' => $columns];
            }
        }

        return $indexes;
    }

    /**
     * Parse foreign keys from SQL.
     */
    private function parseForeignKeys(string $sql): array
    {
        $foreignKeys = [];

        if (preg_match_all('/FOREIGN\s+KEY\s*\(`?([^`\)]+)`?\)\s+REFERENCES\s+`?([^`\s]+)`?\s*\(`?([^`\)]+)`?\)(?:\s+ON\s+DELETE\s+(CASCADE|SET\s+NULL|RESTRICT))?(?:\s+ON\s+UPDATE\s+(CASCADE|SET\s+NULL|RESTRICT))?/i', $sql, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $foreignKeys[] = [
                    'column' => trim($match[1], '`'),
                    'references_table' => trim($match[2], '`'),
                    'references_column' => trim($match[3], '`'),
                    'on_delete' => isset($match[4]) ? strtolower(str_replace(' ', '_', $match[4])) : null,
                    'on_update' => isset($match[5]) ? strtolower(str_replace(' ', '_', $match[5])) : null,
                ];
            }
        }

        return $foreignKeys;
    }

    /**
     * Build the complete migration file content.
     */
    private function buildMigrationContent(string $className, string $tableName, array $columns, array $indexes, array $foreignKeys): string
    {
        $content = "<?php\n\n";
        $content .= "use Illuminate\\Database\\Migrations\\Migration;\n";
        $content .= "use Illuminate\\Database\\Schema\\Blueprint;\n";
        $content .= "use Illuminate\\Support\\Facades\\Schema;\n\n";
        $content .= "return new class extends Migration\n";
        $content .= "{\n";
        $content .= "    /**\n";
        $content .= "     * Run the migrations.\n";
        $content .= "     */\n";
        $content .= "    public function up(): void\n";
        $content .= "    {\n";
        $content .= "        Schema::create('{$tableName}', function (Blueprint \$table) {\n";

        // Add columns
        foreach ($columns as $column) {
            $content .= $this->buildColumnDefinition($column);
        }

        // Add indexes (only if not already handled inline)
        foreach ($indexes as $index) {
            // Skip primary key if it's already handled by id() or inline primary()
            if ($index['type'] === 'primary') {
                $hasPrimaryColumn = false;
                foreach ($columns as $column) {
                    if ($column['primary'] && ($column['name'] === 'id' || $column['auto_increment'])) {
                        $hasPrimaryColumn = true;
                        break;
                    }
                }
                if ($hasPrimaryColumn) {
                    continue;
                }
            }
            $content .= $this->buildIndexDefinition($index);
        }

        // Add foreign keys
        foreach ($foreignKeys as $fk) {
            $content .= $this->buildForeignKeyDefinition($fk);
        }

        $content .= "        });\n";
        $content .= "    }\n\n";
        $content .= "    /**\n";
        $content .= "     * Reverse the migrations.\n";
        $content .= "     */\n";
        $content .= "    public function down(): void\n";
        $content .= "    {\n";
        $content .= "        Schema::dropIfExists('{$tableName}');\n";
        $content .= "    }\n";
        $content .= "};\n";

        return $content;
    }

    /**
     * Build column definition for migration.
     */
    private function buildColumnDefinition(array $column): string
    {
        // Special handling for auto-increment primary key
        if ($column['auto_increment'] && $column['primary'] && $column['name'] === 'id' && $column['type']['method'] === 'integer') {
            return "            \$table->id();\n";
        }

        $line = "            \$table->{$column['type']['method']}('{$column['name']}'";

        // Add parameters if any
        if (!empty($column['type']['params'])) {
            foreach ($column['type']['params'] as $param) {
                if (is_array($param)) {
                    $line .= ", ['" . implode("', '", $param) . "']";
                } else {
                    $line .= ", {$param}";
                }
            }
        }

        $line .= ")";

        // Add modifiers in the correct order
        if ($column['auto_increment'] && !($column['name'] === 'id' && $column['type']['method'] === 'integer')) {
            $line .= "->autoIncrement()";
        }

        if ($column['primary'] && !$column['auto_increment']) {
            $line .= "->primary()";
        }

        if ($column['nullable']) {
            $line .= "->nullable()";
        }

        if ($column['default'] !== null) {
            $defaultValue = is_numeric($column['default']) ? $column['default'] : "'{$column['default']}'";
            $line .= "->default({$defaultValue})";
        }

        if ($column['unique'] && !$column['primary']) {
            $line .= "->unique()";
        }

        if ($column['comment']) {
            $line .= "->comment('{$column['comment']}')";
        }

        $line .= ";\n";
        return $line;
    }

    /**
     * Build index definition for migration.
     */
    private function buildIndexDefinition(array $index): string
    {
        $columns = "'" . implode("', '", $index['columns']) . "'";

        switch ($index['type']) {
            case 'primary':
                return "            \$table->primary([{$columns}]);\n";
            case 'unique':
                return "            \$table->unique([{$columns}], '{$index['name']}');\n";
            case 'index':
                return "            \$table->index([{$columns}], '{$index['name']}');\n";
        }

        return '';
    }

    /**
     * Build foreign key definition for migration.
     */
    private function buildForeignKeyDefinition(array $fk): string
    {
        $line = "            \$table->foreign('{$fk['column']}')->references('{$fk['references_column']}')->on('{$fk['references_table']}')";

        if ($fk['on_delete']) {
            $line .= "->onDelete('{$fk['on_delete']}')";
        }

        if ($fk['on_update']) {
            $line .= "->onUpdate('{$fk['on_update']}')";
        }

        $line .= ";\n";
        return $line;
    }

    /**
     * Save migration to file system.
     */
    public function saveMigrationFile(MigrationGenerator $migration, string $fileName): string
    {
        $timestamp = now()->format('Y_m_d_His');
        $fullFileName = "{$timestamp}_{$fileName}.php";
        $filePath = "migrations/{$fullFileName}";

        \Illuminate\Support\Facades\Storage::disk('local')->put($filePath, $migration->generated_migration);

        return $filePath;
    }
}
