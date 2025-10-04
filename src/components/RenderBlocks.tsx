import { BLOCKS, type AnyBlock } from '@/blocks';

export function RenderBlocks({ blocks, locale }: { blocks: AnyBlock[]; locale: string }) {
  return (
    <>
      {blocks?.map((b, i) => {
        // Narrow by discriminant
        const Cmp = BLOCKS[b.type] as React.ComponentType<{ locale: string } & typeof b.props>;
        return <Cmp key={i} locale={locale} {...b.props} />;
      })}
    </>
  );
}
