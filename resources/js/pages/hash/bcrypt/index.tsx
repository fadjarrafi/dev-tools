import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { Copy, Eye, EyeOff, Hash, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Import toast from sonner

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Hash",
    href: "/hash",
  },
  {
    title: "Bcrypt Generator",
    href: "/hash/bcrypt",
  },
];

export default function BcryptGenerator() {
  const [textToHash, setTextToHash] = useState("");
  const [rounds, setRounds] = useState([12]);
  const [generatedHash, setGeneratedHash] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Verification states
  const [hashToVerify, setHashToVerify] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );
  const [isVerifying, setIsVerifying] = useState(false);

  // Visibility states
  const [showTextToHash, setShowTextToHash] = useState(false);
  const [showOriginalText, setShowOriginalText] = useState(false);

  const generateHash = async () => {
    if (!textToHash.trim()) {
      toast.error("Please enter text to hash."); // Using sonner's toast.error
      return;
    }

    setIsGenerating(true);
    try {
      // Using bcryptjs library for client-side hashing
      const bcrypt = await import("bcryptjs");
      const salt = await bcrypt.genSalt(rounds[0]);
      const hash = await bcrypt.hash(textToHash, salt);
      setGeneratedHash(hash);

      toast.success("Hash generated successfully!"); // Using sonner's toast.success
    } catch (err) {
      // Changed error to err to avoid ESLint warning
      toast.error("Failed to generate hash. Please try again."); // Using sonner's toast.error
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyHash = async () => {
    if (!hashToVerify.trim() || !originalText.trim()) {
      toast.error("Please enter both hash and original text."); // Using sonner's toast.error
      return;
    }

    setIsVerifying(true);
    try {
      const bcrypt = await import("bcryptjs");
      const isValid = await bcrypt.compare(originalText, hashToVerify);
      setVerificationResult(isValid);

      if (isValid) {
        toast.success("The hash matches the original text."); // Using sonner's toast.success
      } else {
        toast.error("The hash does not match the original text."); // Using sonner's toast.error
      }
    } catch (err) {
      // Changed error to err to avoid ESLint warning
      toast.error("Failed to verify hash. Please check the hash format."); // Using sonner's toast.error
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await document.execCommand("copy"); // Using document.execCommand for clipboard copy
      toast.success("Hash copied to clipboard."); // Using sonner's toast.success
    } catch (err) {
      // Changed error to err to avoid ESLint warning
      toast.error("Failed to copy to clipboard."); // Using sonner's toast.error
    }
  };

  const getSecurityLevel = (rounds: number) => {
    if (rounds < 10)
      return {
        level: "Low",
        color: "text-red-600",
        description: "Not recommended for production",
      };
    if (rounds < 12)
      return {
        level: "Medium",
        color: "text-yellow-600",
        description: "Suitable for most applications",
      };
    return {
      level: "High",
      color: "text-green-600",
      description: "Suitable for production",
    };
  };

  const security = getSecurityLevel(rounds[0]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Bcrypt Generator" />

      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Bcrypt Hash Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                A simple tool to generate and verify bcrypt hashes. All
                processing happens in your browser for security.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Generate Hash Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Generate Hash
              </CardTitle>
              <CardDescription>
                Generate a bcrypt hash from your text. Higher rounds provide
                better security but take longer to process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-to-hash">Text to Hash</Label>
                <div className="relative">
                  <Input
                    id="text-to-hash"
                    type={showTextToHash ? "text" : "password"}
                    placeholder="Enter text to hash"
                    value={textToHash}
                    onChange={(e) => setTextToHash(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowTextToHash(!showTextToHash)}
                  >
                    {showTextToHash ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rounds">
                    Rounds (Cost Factor): {rounds[0]}
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${security.color}`}>
                      {security.level} security
                    </span>
                  </div>
                </div>
                <Slider
                  id="rounds"
                  min={4}
                  max={15}
                  step={1}
                  value={rounds}
                  onValueChange={setRounds}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {security.description}
                </p>
              </div>

              <Button
                onClick={generateHash}
                disabled={isGenerating || !textToHash.trim()}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Hash"}
              </Button>

              {generatedHash && (
                <div className="space-y-2">
                  <Label>Generated Hash</Label>
                  <div className="relative">
                    <Textarea
                      value={generatedHash}
                      readOnly
                      className="min-h-[100px] font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(generatedHash)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verify Hash Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify Hash
              </CardTitle>
              <CardDescription>
                Check if a bcrypt hash matches the original text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bcrypt-hash">Bcrypt Hash</Label>
                <Textarea
                  id="bcrypt-hash"
                  placeholder="Paste the bcrypt hash"
                  value={hashToVerify}
                  onChange={(e) => setHashToVerify(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original-text">Original Text</Label>
                <div className="relative">
                  <Input
                    id="original-text"
                    type={showOriginalText ? "text" : "password"}
                    placeholder="Enter the original text"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowOriginalText(!showOriginalText)}
                  >
                    {showOriginalText ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={verifyHash}
                disabled={
                  isVerifying || !hashToVerify.trim() || !originalText.trim()
                }
                className="w-full"
              >
                {isVerifying ? "Verifying..." : "Verify Hash"}
              </Button>

              {verificationResult !== null && (
                <div
                  className={`rounded-lg border p-4 ${
                    verificationResult
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      verificationResult
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">
                      {verificationResult
                        ? "Hash Verified ✓"
                        : "Hash Mismatch ✗"}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      verificationResult
                        ? "text-green-600 dark:text-green-300"
                        : "text-red-600 dark:text-red-300"
                    }`}
                  >
                    {verificationResult
                      ? "The hash matches the original text."
                      : "The hash does not match the original text."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
