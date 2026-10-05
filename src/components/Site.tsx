import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Globe, Mail, Menu, Phone, Search, X, GraduationCap } from "lucide-react";

const links = [
  { to: "/angebote", label: "Kurse & Angebote" },
  { to: "/neuigkeiten", label: "Neuigkeiten" },
  { to: "/publikationen", label: "Materialien" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

type Sub = {
  label: string;
  to: "/angebote" | "/neuigkeiten" | "/publikationen" | "/kontakt";
  hash?: string;
};

const menus: { label: string; to: Sub["to"]; items: Sub[] }[] = [
  {
    label: "Kurse",
    to: "/angebote",
    items: [
      { label: "Deutschkurse", to: "/angebote", hash: "deutsch-lernen" },
      { label: "Weiterbildungen", to: "/angebote", hash: "weiterbildungen" },
      { label: "Workshops", to: "/angebote", hash: "veranstaltungen" },
    ],
  },
];

const languages = ["Deutsch", "English", "العربية", "فارسی", "Українська"];
const langCodes: Record<string, string> = {
  Deutsch: "de",
  English: "en",
  العربية: "ar",
  فارسی: "fa",
  Українська: "uk",
};

function guardDom() {
  const w = window as any;
  if (w.__gtGuard) return;
  w.__gtGuard = true;
  const rc = Node.prototype.removeChild;
  Node.prototype.removeChild = function (this: Node, child: any) {
    if (child.parentNode !== this) return child;
    return rc.call(this, child);
  } as any;
  const ib = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (this: Node, n: any, ref: any) {
    if (ref && ref.parentNode !== this) return
