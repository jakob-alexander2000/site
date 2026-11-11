(function () {
  var DPR_CAP = 2;
  var MAX_PLANES = 4;
  var MAX_DRAW_CALLS = 50;
  var state = {
    dprCap: DPR_CAP,
    maxPlanes: MAX_PLANES,
    maxDrawCalls: MAX_DRAW_CALLS,
    pixelRatio: 1,
    renderCount: 0,
    paused: false,
    canvas: null,
    gl: null,
  };

  function capDpr(dpr) {
    return Math.min(dpr || 1, DPR_CAP);
  }

  function offscreen(canvas) {
    var rect = canvas.getBoundingClientRect();
    return rect.bottom < 0 || rect.top > window.innerHeight || rect.width < 1;
  }

  function renderOnDemand() {
    if (state.paused || document.hidden) return;
    var canvas = state.canvas;
    if (!canvas || offscreen(canvas)) return;
    state.renderCount += 1;
    var gl = state.gl;
    if (!gl) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.04, 0.04, 0.04, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function handleContextLost(event) {
    if (event && event.preventDefault) event.preventDefault();
    state.gl = null;
  }

  function pauseWhenHidden() {
    state.paused = document.hidden;
  }

  function mount(canvas) {
    state.canvas = canvas;
    var gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    if (!gl) return false;
    state.gl = gl;
    state.pixelRatio = capDpr(window.devicePixelRatio);
    var width = canvas.clientWidth || 320;
    var height = canvas.clientHeight || 80;
    canvas.width = Math.max(1, Math.floor(width * state.pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * state.pixelRatio));
    canvas.addEventListener("webglcontextlost", handleContextLost);
    renderOnDemand();
    return true;
  }

  document.addEventListener("visibilitychange", function () {
    pauseWhenHidden();
    if (!document.hidden) renderOnDemand();
  });

  window.__closeReadingStage = {
    state: state,
    mount: mount,
    capDpr: capDpr,
    handleContextLost: handleContextLost,
    pauseWhenHidden: pauseWhenHidden,
    renderOnDemand: renderOnDemand,
  };
})();
