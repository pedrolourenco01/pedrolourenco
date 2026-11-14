import { SlideUpText } from "@/components/ui/slide-up-text";

export default function SlideUpTextDemo() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center bg-background p-8">
      <SlideUpText
        split="characters"
        stagger={0.03}
        className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
      >
        You can just ship things.
      </SlideUpText>
    </div>
  );
}
