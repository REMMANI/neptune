
import * as Base from '@/blocks';
import {
    type AnyBlock, type HeroProps, type FeaturesProps, type FooterProps,
} from '@/blocks';
import type { ResolvedTheme } from '@/themes/loader';

async function resolveComponent(type: AnyBlock['type'], theme?: ResolvedTheme) {
    const override = theme?.components?.[type as string];
    if (override) {
        const mod = await override();
        return mod?.default;             
    }
    return (Base as any)[type];        
}

export async function RenderBlocks({
    blocks,
    brand,
    theme,
    locale,
}: {
    blocks: AnyBlock[] | unknown;
    brand?: { name?: string; logo?: string };
    theme?: ResolvedTheme;             
    locale?: string;
}) {
    const list: AnyBlock[] = Array.isArray(blocks) ? (blocks as AnyBlock[]) : [];

    const children: React.ReactNode[] = [];
    for (let i = 0; i < list.length; i++) {
        const b = list[i]!;
        const Cmp = await resolveComponent(b.type, theme);
        if (!Cmp) throw new Error(`Unknown block "${b.type}" at ${i}`);

        switch (b.type) {
            case 'Hero': {
                const p: HeroProps = { title: 'Welcome', locale, ...(b.props as HeroProps) };
                children.push(<Cmp key={i} {...p} />);
                break;
            }
            case 'Features': {
                const p: FeaturesProps = { items: [], ...(b.props as FeaturesProps) };
                children.push(<Cmp key={i} {...p} />);
                break;
            }
            case 'Footer': {
                const p: FooterProps = { year: new Date().getFullYear(), ...(b.props as FooterProps) };
                if (!p.brand && brand) p.brand = brand;
                children.push(<Cmp key={i} {...p} />);
                break;
            }
            default:
                break;
        }
    }
    return <>{children}</>;
}
