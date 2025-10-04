'use client';
import React from 'react';


export default function ThemeStyle({ tokens }: { tokens: Record<string, string> }) {
    const css = Object.entries(tokens).map(([k, v]) => `--${k}:${v};`).join('');
    return <style dangerouslySetInnerHTML={{ __html: `:root{${css}}` }} />;
}