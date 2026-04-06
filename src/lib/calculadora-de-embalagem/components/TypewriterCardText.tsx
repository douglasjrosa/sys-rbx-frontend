import { Text } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Milliseconds between each character reveal. */
export const DEFAULT_TYPEWRITER_CHAR_INTERVAL_MS = 20;

type QueueState = {
  cursor: number;
  snapshots: Record<number, string>;
};

export type TypewriterBlockContextValue = {
  blockVisible: boolean;
  resetEpoch: number;
  charIntervalMs: number;
  cursor: number;
  snapshots: Record<number, string>;
  reportComplete: (lineIndex: number, finalText: string) => void;
  reportSkip: (lineIndex: number) => void;
};

const TypewriterBlockContext =
  createContext<TypewriterBlockContextValue | null>(null);

function useTypewriterBlockContext(): TypewriterBlockContextValue {
  const ctx = useContext(TypewriterBlockContext);
  if (!ctx) {
    throw new Error("TypewriterCardText must be used inside TypewriterBlock");
  }
  return ctx;
}

export type TypewriterBlockProps = {
  /**
   * When false, every line renders empty and the queue resets when hidden.
   * When true again, typing restarts from line 0.
   */
  blockVisible: boolean;
  /** When this identity changes, cursor and snapshots reset (e.g. template id). */
  resetKey?: string;
  charIntervalMs?: number;
  children: ReactNode;
};

/**
 * Owns one sequential typewriter queue for a single UI block.
 * Lines use explicit `lineIndex` (0, 1, 2, ...) inside this block only.
 */
export function TypewriterBlock(props: TypewriterBlockProps) {
  const {
    blockVisible,
    resetKey = "",
    charIntervalMs = DEFAULT_TYPEWRITER_CHAR_INTERVAL_MS,
    children,
  } = props;

  const [queue, setQueue] = useState<QueueState>({
    cursor: 0,
    snapshots: {},
  });
  const [resetEpoch, setResetEpoch] = useState(0);
  const lastResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (!blockVisible) {
      setQueue({ cursor: 0, snapshots: {} });
      setResetEpoch((e) => e + 1);
    }
  }, [blockVisible]);

  useEffect(() => {
    if (lastResetKeyRef.current === resetKey) return;
    lastResetKeyRef.current = resetKey;
    setQueue({ cursor: 0, snapshots: {} });
    setResetEpoch((e) => e + 1);
  }, [resetKey]);

  const reportComplete = useCallback(
    (lineIndex: number, finalText: string) => {
      setQueue((q) => {
        if (q.cursor !== lineIndex) return q;
        return {
          cursor: lineIndex + 1,
          snapshots: { ...q.snapshots, [lineIndex]: finalText },
        };
      });
    },
    [],
  );

  const reportSkip = useCallback((lineIndex: number) => {
    setQueue((q) => {
      if (q.cursor !== lineIndex) return q;
      return { ...q, cursor: lineIndex + 1 };
    });
  }, []);

  const value = useMemo<TypewriterBlockContextValue>(
    () => ({
      blockVisible,
      resetEpoch,
      charIntervalMs,
      cursor: queue.cursor,
      snapshots: queue.snapshots,
      reportComplete,
      reportSkip,
    }),
    [
      blockVisible,
      resetEpoch,
      charIntervalMs,
      queue.cursor,
      queue.snapshots,
      reportComplete,
      reportSkip,
    ],
  );

  return (
    <TypewriterBlockContext.Provider value={value}>
      {children}
    </TypewriterBlockContext.Provider>
  );
}

export type TypewriterCardTextProps = {
  text: string;
  /** Position in this block queue (0 = first). */
  lineIndex: number;
  /**
   * When false while this line is active, the block skips typing and advances.
   * Hidden lines do not show text once skipped.
   */
  isVisible?: boolean;
} & ComponentProps<typeof Text>;

/**
 * Per-line typewriter inside a TypewriterBlock.
 *
 * First line rule (and same pattern for others at their turn):
 * - Block hidden → render empty.
 * - Block visible, not this line’s turn yet → empty until prior lines finish.
 * - This line’s turn and line hidden → skip and advance the block queue.
 * - This line’s turn and line visible → type; when done, full text stays visible.
 * - Already completed earlier in the queue → show final text from snapshot.
 */
export function TypewriterCardText(props: TypewriterCardTextProps) {
  const {
    text,
    lineIndex,
    isVisible = true,
    ...textProps
  } = props;

  const {
    blockVisible,
    resetEpoch,
    charIntervalMs,
    cursor,
    snapshots,
    reportComplete,
    reportSkip,
  } = useTypewriterBlockContext();

  const [liveSlice, setLiveSlice] = useState("");

  useEffect(() => {
    setLiveSlice("");
  }, [text, resetEpoch, lineIndex]);

  useEffect(() => {
    if (!blockVisible || cursor !== lineIndex) return;
    if (isVisible) return;
    reportSkip(lineIndex);
  }, [blockVisible, cursor, lineIndex, isVisible, reportSkip]);

  useEffect(() => {
    if (!blockVisible) return;
    if (cursor !== lineIndex) return;
    if (!isVisible) return;

    const chars = Array.from(text);
    if (chars.length === 0) {
      reportComplete(lineIndex, "");
      return;
    }

    let charIndex = 0;
    const intervalId = window.setInterval(() => {
      charIndex += 1;
      setLiveSlice(chars.slice(0, charIndex).join(""));
      if (charIndex >= chars.length) {
        window.clearInterval(intervalId);
        reportComplete(lineIndex, chars.join(""));
      }
    }, charIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [
    blockVisible,
    cursor,
    lineIndex,
    isVisible,
    text,
    charIntervalMs,
    reportComplete,
    resetEpoch,
  ]);

  let display = "";
  if (!blockVisible) {
    display = "";
  } else if (cursor > lineIndex) {
    display = snapshots[lineIndex] ?? "";
  } else if (cursor === lineIndex) {
    display = isVisible ? liveSlice : "";
  } else {
    display = "";
  }

  return (
    <Text textAlign="left" {...textProps}>
      {display}
    </Text>
  );
}
