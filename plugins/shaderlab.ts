import type { HLJSApi, Language } from 'highlight.js';

/**
 * Highlight.js grammar for PiaEngine `.shader` files (ShaderLab-like header + GLSL body).
 * The code between GLSLPROGRAM/ENDGLSL and VERTEXPROGRAM/ENDVERTEX is highlighted as GLSL.
 */
export function shaderlab(hljs: HLJSApi): Language {
  return {
    name: 'ShaderLab',
    aliases: ['shader', 'pia-shader'],
    keywords: {
      keyword:
        'Shader Properties SubShader Pass Pipeline Lighting Cull ZWrite ZTest Blend BlendOp ColorMask Offset Queue Tags ' +
        'Stencil Fog Padding Ref Comp ReadMask WriteMask Fail ZFail',
      literal:
        'On Off Back Front Opaque Alpha Additive Multiply Screen Standard Toon Lambert BlinnPhong Unlit ' +
        'Less LEqual Equal GEqual Greater NotEqual Always Never Keep Replace Zero One IncrSat DecrSat Invert ' +
        'SrcAlpha OneMinusSrcAlpha DstColor SrcColor OneMinusDstColor Add Sub RevSub Min Max ' +
        'Background Geometry AlphaTest Transparent Overlay',
      type: 'Color Range Float Int Vector 2D 3D',
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      { scope: 'literal', begin: /\b[23]D\b/ },
      hljs.C_NUMBER_MODE,
      {
        scope: 'keyword',
        begin: /\b(?:GLSLPROGRAM|VERTEXPROGRAM)\b/,
        starts: { end: /(?=\b(?:ENDGLSL|ENDVERTEX)\b)/, subLanguage: 'glsl' },
      },
      { scope: 'keyword', begin: /\b(?:ENDGLSL|ENDVERTEX)\b/ },
      { scope: 'meta', begin: /\[/, end: /\]/ },
    ],
  };
}
