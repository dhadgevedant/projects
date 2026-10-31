/**
 * Monopo Saigon — Bold & Rich Liquid Iridescent Shader
 * Features Dynamic Negative/Opposite Typography:
 * Every pixel of the monumental hero title ("VEDANT DHADGE") is calculated on the GPU
 * as the true mathematical negative (1.0 - fluidColor) of whatever fluid wave is flowing behind it.
 * Colors continuously ripple, swirl, and transform across each letter in real time.
 * 
 * Palette:
 * - Obsidian:           #000000
 * - Rich Molten Oxblood: rgb(190, 24, 24)
 * - Fiery Amber Gold:    rgb(255, 155, 18)
 * - Vibrant Emerald Teal: rgb(16, 198, 132)
 * - Incandescent Gold:   rgb(255, 220, 85)
 */
(function() {
  function initLiquidShader(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', { 
        antialias: true, 
        alpha: false, 
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
      }) || canvas.getContext('experimental-webgl');
    } catch (e) {
      console.warn('WebGL init failed:', e);
    }

    if (!gl) {
      if (canvas.parentElement) {
        canvas.parentElement.classList.add('iridescent-fallback-active');
      }
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      #ifdef GL_ES
      precision highp float;
      #endif

      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform sampler2D u_textTexture;
      uniform int u_hasTextTexture;
      uniform int u_isMobile;

      // 2D Simplex noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float val = 0.0;
        float amp = 0.55;
        for (int i = 0; i < 3; i++) {
          val += amp * snoise(p);
          p *= 2.02;
          amp *= 0.48;
        }
        return val;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uv = st;
        uv.x *= aspect;

        // Slow, hypnotic fluid tempo
        float t = u_time * 0.16;

        // Smooth cursor liquid deflection
        vec2 mouseUV = u_mouse / u_resolution.xy;
        mouseUV.x *= aspect;
        float dMouse = length(uv - mouseUV);
        vec2 mousePush = (uv - mouseUV) * exp(-dMouse * 3.2) * 0.28;
        uv += mousePush;

        // Molten fluid domain warping
        vec2 q = vec2(fbm(uv * 0.85 + vec2(0.0, 0.0) + t * 0.35),
                      fbm(uv * 0.85 + vec2(5.2, 1.3) + t * 0.28));

        vec2 r = vec2(fbm(uv * 0.95 + 2.2 * q + vec2(1.7, 9.2) + t * 0.22),
                      fbm(uv * 0.95 + 2.2 * q + vec2(8.3, 2.8) + t * 0.18));

        float f = fbm(uv + 2.0 * r);

        // Bold & Rich Saturated Palette:
        vec3 cObsidian = vec3(0.0, 0.0, 0.0);
        vec3 cOxblood  = vec3(190.0 / 255.0, 24.0 / 255.0, 24.0 / 255.0);  // Rich burning oxblood
        vec3 cAmber    = vec3(255.0 / 255.0, 155.0 / 255.0, 18.0 / 255.0); // Bold molten amber
        vec3 cTeal     = vec3(16.0 / 255.0, 198.0 / 255.0, 132.0 / 255.0); // Vibrant chromatic emerald teal
        vec3 cGold     = vec3(255.0 / 255.0, 220.0 / 255.0, 85.0 / 255.0); // Incandescent golden crest

        // Chromatic weights with rich S-curves
        float wOxblood = smoothstep(-0.25, 0.65, q.x * 1.3 + r.y * 0.7);
        float wAmber   = smoothstep(-0.15, 0.70, r.x * 1.35 + f * 0.65);
        float wTeal    = smoothstep(-0.05, 0.75, f * 1.35 - q.y * 0.6);

        // Layered composition
        vec3 color = cObsidian;
        color = mix(color, cOxblood, clamp(wOxblood * 1.35, 0.0, 1.0));
        color = mix(color, cAmber,   clamp(wAmber * 1.25, 0.0, 1.0));
        color = mix(color, cTeal,    clamp(wTeal * 1.20, 0.0, 1.0));

        // Incandescent molten highlights where waves collide
        float crest = clamp(pow(max(0.0, f * 1.15), 3.0) * 1.8, 0.0, 1.0);
        color += cGold * crest * 0.50;

        // Perimeter vignette
        float distCenter = length(st - vec2(0.5, 0.5));
        float vignette = smoothstep(1.35, 0.35, distCenter);
        color *= vignette;
        color = clamp(color, 0.0, 1.0);

        // Dynamic Negative Typography Inversion (Lighter on mobile for high legibility without borders)
        if (u_hasTextTexture == 1) {
          vec2 textUV = vec2(st.x, 1.0 - st.y);
          vec4 textTex = texture2D(u_textTexture, textUV);
          float fillMask = textTex.r;    // Text fill in Red channel

          if (fillMask > 0.0) {
            // True mathematical negative: exact complement of whatever is behind it
            vec3 negColor = vec3(1.0) - color;
            if (u_isMobile == 1) {
              // Same negative color identity, but lifted & lightened on mobile for clean visibility without borders
              negColor = mix(pow(negColor, vec3(0.80)), vec3(1.0), 0.28);
            }
            color = mix(color, negColor, fillMask);
          }
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(glCtx, type, source) {
      const shader = glCtx.createShader(type);
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const textTexLoc = gl.getUniformLocation(program, 'u_textTexture');
    const hasTextLoc = gl.getUniformLocation(program, 'u_hasTextTexture');
    const isMobileLoc = gl.getUniformLocation(program, 'u_isMobile');

    // Setup Text Texture Buffer
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d');
    const textTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let mouse = [window.innerWidth * 0.5, window.innerHeight * 0.5];
    let targetMouse = [mouse[0], mouse[1]];

    window.addEventListener('mousemove', (e) => {
      targetMouse[0] = e.clientX;
      targetMouse[1] = window.innerHeight - e.clientY;
    }, { passive: true });

    function updateTextTexture() {
      if (!textCanvas || !textCtx || !gl || !textTexture) return;

      textCanvas.width = canvas.width;
      textCanvas.height = canvas.height;
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

      const headlineEl = document.querySelector('.hero-display-headline');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      let fontSize = Math.min(canvas.width * 0.13, canvas.height * 0.22);
      let fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      let centerX = textCanvas.width * 0.5;
      let centerY = textCanvas.height * 0.44; // Vertically positioned above bottom bar
      let letterSpacing = -0.035 * fontSize;

      let fontWeight = '400';

      if (headlineEl) {
        const rect = headlineEl.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const style = window.getComputedStyle(headlineEl);

        if (rect.width > 0 && rect.height > 0 && canvasRect.width > 0 && canvasRect.height > 0) {
          const scaleX = textCanvas.width / canvasRect.width;
          const scaleY = textCanvas.height / canvasRect.height;

          fontSize = parseFloat(style.fontSize) * scaleX;
          fontWeight = style.fontWeight || '400';
          const parsedSpacing = parseFloat(style.letterSpacing);
          letterSpacing = (isNaN(parsedSpacing) ? (-0.035 * fontSize / scaleX) : parsedSpacing) * scaleX;

          centerX = textCanvas.width * 0.5;
          centerY = (rect.top - canvasRect.top + rect.height * 0.5) * scaleY;
        }
      }

      const isMobile = window.innerWidth <= 900;

      textCtx.save();
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
      textCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      if (textCtx.letterSpacing !== undefined) {
        textCtx.letterSpacing = `${letterSpacing}px`;
      }

      // Draw VEDANT and DHADGE in tight monumental editorial typography
      const lineGap = fontSize * 0.88;

      // Draw text fill in Red channel (fillMask)
      textCtx.fillStyle = 'rgb(255, 0, 0)';
      textCtx.fillText('VEDANT', centerX, centerY - lineGap * 0.5);
      textCtx.fillText('DHADGE', centerX, centerY + lineGap * 0.5);
      textCtx.restore();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const hero = document.getElementById('hero');
      const width = hero ? hero.offsetWidth : window.innerWidth;
      const height = hero ? hero.offsetHeight : window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      updateTextTexture();
    }

    window.addEventListener('resize', resize, { passive: true });
    
    // Refresh text texture when fonts are loaded or layout settles
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateTextTexture();
      });
    }
    setTimeout(updateTextTexture, 200);
    setTimeout(updateTextTexture, 600);

    resize();

    let startTime = performance.now();

    function render() {
      mouse[0] += (targetMouse[0] - mouse[0]) * 0.04;
      mouse[1] += (targetMouse[1] - mouse[1]) * 0.04;

      gl.useProgram(program);

      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, (performance.now() - startTime) * 0.001);
      gl.uniform2f(mouseLoc, mouse[0] * dpr, mouse[1] * dpr);

      // Bind text texture to texture unit 0
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTexture);
      gl.uniform1i(textTexLoc, 0);
      gl.uniform1i(hasTextLoc, 1);
      gl.uniform1i(isMobileLoc, (window.innerWidth <= 900) ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  window.initLiquidShader = initLiquidShader;
})();
