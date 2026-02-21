"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";

type Props = {
  onApplyText: (text: string) => void;
  hintExamples?: string[];
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

export function VoiceInput({ onApplyText, hintExamples = [] }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [listening, setListening] = useState(false);

  const finalRef = useRef<string>("");

  const recRef = useRef<SpeechRecognition | null>(null);

  const [interim, setInterim] = useState("");

  const [draft, setDraft] = useState("");

  const RecognitionCtor = useMemo(() => {
    if (!mounted || typeof window === "undefined") return null;
    const w = window as SpeechWindow;
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  }, [mounted]);

  const supported = Boolean(RecognitionCtor);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {}
      recRef.current = null;
    };
  }, []);

  function syncDraft(newInterim = interim) {
    const full = `${finalRef.current} ${newInterim}`
      .replace(/\s+/g, " ")
      .trim();
    setDraft(full);
  }

  function start() {
    if (!RecognitionCtor) return;

    finalRef.current = draft.trim();
    setInterim("");

    const rec = new RecognitionCtor();
    rec.lang = "pt-BR";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let newFinal = "";
      let newInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const t = res[0]?.transcript ?? "";
        if (res.isFinal) newFinal += ` ${t}`;
        else newInterim += ` ${t}`;
      }

      if (newFinal.trim()) {
        finalRef.current = `${finalRef.current} ${newFinal}`
          .replace(/\s+/g, " ")
          .trim();
      }

      const cleanedInterim = newInterim.replace(/\s+/g, " ").trim();
      setInterim(cleanedInterim);
      setDraft(
        `${finalRef.current} ${cleanedInterim}`.replace(/\s+/g, " ").trim(),
      );
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.onend = () => {
      if (listening) {
        try {
          rec.start();
        } catch {
          setListening(false);
        }
      }
    };

    recRef.current = rec;

    try {
      rec.start();
      setListening(true);
      syncDraft("");
    } catch {
      setListening(false);
    }
  }

  function stop() {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
    setInterim("");
    setDraft(finalRef.current);
  }

  function toggle() {
    if (!supported) return;
    if (listening) stop();
    else start();
  }

  function apply() {
    const text = draft.trim();
    if (!text) return;
    onApplyText(text);
    finalRef.current = "";
    setInterim("");
    setDraft("");
  }

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <p className="font-semibold">Comando por voz</p>
            <Badge tone="pink">Carregando…</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">Comando por voz</p>
              <Badge tone={supported ? "green" : "pink"}>
                {!supported
                  ? "Indisponível"
                  : listening
                    ? "Ouvindo…"
                    : "Disponível"}
              </Badge>
            </div>

            {hintExamples.length > 0 && (
              <p className="text-sm text-white/60">
                Exemplos:{" "}
                {hintExamples
                  .slice(0, 3)
                  .map((h, i) => (i ? " • " : "") + `"${h}"`)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={toggle} disabled={!supported}>
              {listening ? "Parar" : "Falar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={apply}
              disabled={!draft.trim()}
            >
              Aplicar no plano
            </Button>
          </div>
        </div>

        <textarea
          className="w-full min-h-[100px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white/90 outline-none"
          placeholder="O texto reconhecido aparece aqui (você pode editar antes de aplicar)."
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            finalRef.current = e.target.value;
            setInterim("");
          }}
        />
      </CardContent>
    </Card>
  );
}
