import fs from 'fs';
import path from 'path';

export default function fRollupClear(options = {}) {
  const outputDir = options.outputDir || 'dist';

  // todo f 完善插件
  return {
    name: 'f-rollup-clear',
    buildStart() {
      try {
        fs.rmSync(path.resolve(outputDir), { recursive: true, force: true });
        console.log(`Deleted ${outputDir} success`);
      } catch (err) {
        console.error(`Error deleting ${outputDir}: ${err.message}`);
      }
    }
  };
}
