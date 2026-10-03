const { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } = require('next/constants');

/** @type {(phase: string) => import('next').NextConfig} */
module.exports = (phase) => ({
  // Keep build checks from overwriting chunks used by a running dev server.
  distDir: phase === PHASE_PRODUCTION_BUILD || phase === PHASE_PRODUCTION_SERVER
    ? '.next-production'
    : '.next',
});
