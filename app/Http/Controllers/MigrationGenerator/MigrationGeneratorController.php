<?php

namespace App\Http\Controllers\MigrationGenerator;

use App\Http\Controllers\Controller;
use App\Models\MigrationGenerator;
use App\Services\MigrationGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MigrationGeneratorController extends Controller
{
    protected MigrationGeneratorService $migrationService;

    public function __construct(MigrationGeneratorService $migrationService)
    {
        $this->migrationService = $migrationService;
    }

    /**
     * Display the migration generator interface.
     */
    public function index(): InertiaResponse
    {
        $migrations = MigrationGenerator::with('creator')
            ->orderBy('updated_at', 'desc')
            ->paginate(10);

        // Ensure the paginated data has the correct structure
        return Inertia::render('migration-generator/index', [
            'migrations' => [
                'data' => $migrations->items(),
                'links' => $migrations->linkCollection()->toArray(),
                'meta' => [
                    'total' => $migrations->total(),
                    'current_page' => $migrations->currentPage(),
                    'last_page' => $migrations->lastPage(),
                    'per_page' => $migrations->perPage(),
                    'from' => $migrations->firstItem(),
                    'to' => $migrations->lastItem(),
                ],
            ],
        ]);
    }

    /**
     * Generate a Laravel migration from SQL schema.
     */
    public function generate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|regex:/^[a-zA-Z_][a-zA-Z0-9_]*$/',
            'sql_schema' => 'required|string|min:10|max:50000',
            'notes' => 'nullable|string|max:1000',
        ], [
            'name.regex' => 'Migration name must be a valid identifier (letters, numbers, underscores only, starting with letter or underscore).',
            'sql_schema.min' => 'SQL schema must be at least 10 characters long.',
            'sql_schema.max' => 'SQL schema is too large. Maximum 50,000 characters allowed.',
        ]);

        try {
            // Security: Sanitize and validate SQL input
            $sanitizedSql = $this->migrationService->sanitizeSqlInput($validated['sql_schema']);

            // Generate migration code
            $migrationCode = $this->migrationService->generateMigration(
                $validated['name'],
                $sanitizedSql
            );

            // Save to database
            $migration = MigrationGenerator::create([
                'name' => $validated['name'],
                'sql_schema' => $sanitizedSql,
                'generated_migration' => $migrationCode,
                'status' => 'generated',
                'created_by' => Auth::id(),
                'notes' => $validated['notes'],
            ]);

            return redirect()->route('tools.migration-generator.index')
                ->with('success', 'Migration generated successfully!')
                ->with('generatedId', $migration->id);
        } catch (\Exception $e) {
            // Log error for debugging
            Log::error('Migration generation failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'sql_preview' => substr($validated['sql_schema'], 0, 200) . '...'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to generate migration: ' . $e->getMessage());
        }
    }

    /**
     * Save migration to file system.
     */
    public function save(Request $request, MigrationGenerator $migration): RedirectResponse
    {
        $validated = $request->validate([
            'file_name' => 'required|string|max:255|regex:/^[a-zA-Z0-9_]+$/',
        ], [
            'file_name.regex' => 'File name must contain only letters, numbers, and underscores.',
        ]);

        try {
            $filePath = $this->migrationService->saveMigrationFile(
                $migration,
                $validated['file_name']
            );

            $migration->update([
                'migration_file_path' => $filePath,
                'status' => 'saved',
            ]);

            return redirect()->back()
                ->with('success', 'Migration file saved successfully!')
                ->with('filePath', $filePath);
        } catch (\Exception $e) {
            Log::error('Migration file save failed', [
                'error' => $e->getMessage(),
                'migration_id' => $migration->id,
                'user_id' => Auth::id(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to save migration file: ' . $e->getMessage());
        }
    }

    /**
     * Download migration file.
     */
    public function download(MigrationGenerator $migration): Response
    {
        if (!$migration->generated_migration) {
            abort(404, 'Migration content not found');
        }

        $fileName = 'migration_' . $migration->name . '_' . now()->format('Y_m_d_His') . '.php';

        return response($migration->generated_migration)
            ->header('Content-Type', 'application/octet-stream')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
    }

    /**
     * Delete a migration record.
     */
    public function destroy(MigrationGenerator $migration): RedirectResponse
    {
        try {
            // Delete associated file if exists
            if ($migration->migration_file_path && Storage::exists($migration->migration_file_path)) {
                Storage::delete($migration->migration_file_path);
            }

            $migration->delete();

            return redirect()->route('tools.migration-generator.index')
                ->with('success', 'Migration deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Migration deletion failed', [
                'error' => $e->getMessage(),
                'migration_id' => $migration->id,
                'user_id' => Auth::id(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to delete migration: ' . $e->getMessage());
        }
    }

    /**
     * Duplicate an existing migration.
     */
    public function duplicate(MigrationGenerator $migration): RedirectResponse
    {
        try {
            $newMigration = $migration->replicate();
            $newMigration->name = $migration->name . '_copy_' . now()->format('His');
            $newMigration->status = 'generated';
            $newMigration->migration_file_path = null;
            $newMigration->created_by = Auth::id();
            $newMigration->save();

            return redirect()->route('tools.migration-generator.index')
                ->with('success', 'Migration duplicated successfully!')
                ->with('generatedId', $newMigration->id);
        } catch (\Exception $e) {
            Log::error('Migration duplication failed', [
                'error' => $e->getMessage(),
                'migration_id' => $migration->id,
                'user_id' => Auth::id(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to duplicate migration: ' . $e->getMessage());
        }
    }
}
