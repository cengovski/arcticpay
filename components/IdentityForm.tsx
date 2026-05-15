// components/IdentityForm.tsx
// Circle Onchain Travel Rule Identity form
// Collects source.identities for $3,000+ transfers

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buildIdentityPayload, validateTravelRule, Identity } from "@/lib/circleIdentity";
import { User, Building2 } from "lucide-react";

interface IdentityFormProps {
  amount: string;
  onSubmit: (payload: object) => void;
  onCancel: () => void;
}

export function IdentityForm({ amount, onSubmit, onCancel }: IdentityFormProps) {
  const [identityType, setIdentityType] = useState<"INDIVIDUAL" | "BUSINESS">("INDIVIDUAL");
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [taxId, setTaxId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const needsIdentity = validateTravelRule(amount);

  const handleSubmit = () => {
    const identity: Identity = {
      type: identityType,
      name,
      address: { street, city, country },
      ...(taxId && { taxId }),
      ...(dateOfBirth && { dateOfBirth }),
    };

    const payload = buildIdentityPayload(identity);
    onSubmit(payload);
  };

  if (!needsIdentity) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-slate-400">
            Amount is below $3,000 threshold. No identity required.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-cyan-400" />
          Travel Rule Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-400">
          Required for transfers ≥ $3,000. Data is sent to Circle for compliance.
        </p>

        {/* Identity Type */}
        <div className="flex gap-2">
          <button
            onClick={() => setIdentityType("INDIVIDUAL")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              identityType === "INDIVIDUAL"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "bg-white/5 text-slate-400 border border-white/10"
            }`}
          >
            <User className="h-3 w-3" />
            Individual
          </button>
          <button
            onClick={() => setIdentityType("BUSINESS")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              identityType === "BUSINESS"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "bg-white/5 text-slate-400 border border-white/10"
            }`}
          >
            <Building2 className="h-3 w-3" />
            Business
          </button>
        </div>

        {/* Name */}
        <Input
          placeholder={identityType === "INDIVIDUAL" ? "Full Name" : "Business Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Address */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Street Address"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <Input
          placeholder="Country (ISO 3166-1 alpha-2, e.g., US)"
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
          maxLength={2}
        />

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Tax ID (optional)"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
          />
          {identityType === "INDIVIDUAL" && (
            <Input
              type="date"
              placeholder="Date of Birth (optional)"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !street || !city || !country}
            className="flex-1"
          >
            Submit Identity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
