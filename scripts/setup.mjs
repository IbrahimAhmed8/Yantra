import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const aiDir = join(rootDir, 'ai');
const aiTempDir = join(aiDir, '.tmp');
const isWindows = process.platform === 'win32';
const npmExecPath = process.env.npm_execpath;
const args = new Set(process.argv.slice(2));
const shouldValidate = !args.has('--skip-validation');
const shouldReindex = args.has('--reindex');
const venvPython = isWindows
  ? join(aiDir, '.venv', 'Scripts', 'python.exe')
  : join(aiDir, '.venv', 'bin', 'python');
const venvPip = isWindows
  ? join(aiDir, '.venv', 'Scripts', 'pip.exe')
  : join(aiDir, '.venv', 'bin', 'pip');
const venvPytest = isWindows
  ? join(aiDir, '.venv', 'Scripts', 'pytest.exe')
  : join(aiDir, '.venv', 'bin', 'pytest');
const venvUvicorn = isWindows
  ? join(aiDir, '.venv', 'Scripts', 'uvicorn.exe')
  : join(aiDir, '.venv', 'bin', 'uvicorn');
const aiEnv = {
  ...process.env,
  TEMP: aiTempDir,
  TMP: aiTempDir,
};

function logStep(message) {
  console.log(`\n==> ${message}`);
}

function fail(message) {
  console.error(`\nSetup failed: ${message}`);
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || rootDir,
    env: options.env || process.env,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    fail(`Could not run ${command}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`${command} ${commandArgs.join(' ')} exited with code ${result.status ?? 'unknown'}.`);
  }
}

function commandExists(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    env: process.env,
    encoding: 'utf8',
    stdio: 'pipe',
    shell: false,
  });

  if (result.error) {
    return false;
  }

  return result.status === 0;
}

function runNpm(commandArgs, options = {}) {
  run(npmInvocation.command, [...npmInvocation.baseArgs, ...commandArgs], options);
}

function resolvePythonInvocation() {
  if (process.env.PYTHON_BIN) {
    return {
      command: process.env.PYTHON_BIN,
      baseArgs: [],
    };
  }

  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const pythonRoot = join(localAppData, 'Programs', 'Python');
      if (existsSync(pythonRoot)) {
        const candidates = readdirSync(pythonRoot, { withFileTypes: true })
          .filter((entry) => entry.isDirectory() && entry.name.startsWith('Python'))
          .map((entry) => join(pythonRoot, entry.name, 'python.exe'))
          .filter((candidatePath) => existsSync(candidatePath))
          .sort()
          .reverse();

        if (candidates.length > 0) {
          return {
            command: candidates[0],
            baseArgs: [],
          };
        }
      }

      const launcherPath = join(localAppData, 'Programs', 'Python', 'Launcher', 'py.exe');
      if (existsSync(launcherPath)) {
        return {
          command: launcherPath,
          baseArgs: ['-3'],
        };
      }
    }
  }

  const candidates = isWindows
    ? [
        { command: 'py.exe', baseArgs: ['-3'] },
        { command: 'py', baseArgs: ['-3'] },
        { command: 'python.exe', baseArgs: [] },
        { command: 'python', baseArgs: [] },
      ]
    : [
        { command: 'python3', baseArgs: [] },
        { command: 'python', baseArgs: [] },
      ];

  for (const candidate of candidates) {
    if (commandExists(candidate.command, [...candidate.baseArgs, '--version'])) {
      return candidate;
    }
  }

  fail('Python 3.11+ is required but no usable Python executable was found.');
}

function resolveNpmInvocation() {
  if (npmExecPath && existsSync(npmExecPath)) {
    return {
      command: process.execPath,
      baseArgs: [npmExecPath],
    };
  }

  const bundledNpmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (existsSync(bundledNpmCli)) {
    return {
      command: process.execPath,
      baseArgs: [bundledNpmCli],
    };
  }

  const candidates = isWindows ? ['npm.cmd', 'npm'] : ['npm'];
  for (const candidate of candidates) {
    if (commandExists(candidate, ['--version'])) {
      return {
        command: candidate,
        baseArgs: [],
      };
    }
  }

  fail('npm is required but no usable npm executable was found.');
}

const npmInvocation = resolveNpmInvocation();
const pythonInvocation = resolvePythonInvocation();

function runPython(commandArgs, options = {}) {
  run(pythonInvocation.command, [...pythonInvocation.baseArgs, ...commandArgs], options);
}

function ensureFileFromExample(targetPath, examplePath) {
  if (existsSync(targetPath)) {
    console.log(`Keeping existing ${targetPath.replace(`${rootDir}\\`, '').replace(`${rootDir}/`, '')}`);
    return;
  }

  copyFileSync(examplePath, targetPath);
  console.log(`Created ${targetPath.replace(`${rootDir}\\`, '').replace(`${rootDir}/`, '')} from example`);
}

function ensureRequirements() {
  logStep('Checking local requirements');

  const majorNodeVersion = Number.parseInt(process.versions.node.split('.')[0], 10);
  if (Number.isNaN(majorNodeVersion) || majorNodeVersion < 20) {
    fail(`Node.js 20+ is required, but found ${process.version}.`);
  }

  console.log(`Using Node ${process.version}`);
  runPython(['--version']);
}

function ensureEnvFiles() {
  logStep('Creating local env files if needed');

  ensureFileFromExample(join(rootDir, '.env.local'), join(rootDir, '.env.example'));
  ensureFileFromExample(join(aiDir, '.env'), join(aiDir, '.env.example'));
}

function installWebDependencies() {
  logStep('Installing Next.js app dependencies');
  runNpm(['install'], { cwd: rootDir });
}

function ensurePythonEnvironment() {
  logStep('Preparing the Python AI virtual environment');

  mkdirSync(aiTempDir, { recursive: true });

  if (!existsSync(venvPython)) {
    runPython(['-m', 'venv', '.venv'], { cwd: aiDir, env: aiEnv });
  } else {
    console.log('Reusing existing ai/.venv');
  }

  if (!existsSync(venvPip)) {
    run(venvPython, ['-m', 'ensurepip', '--default-pip'], { cwd: aiDir, env: aiEnv });
  }

  if (existsSync(venvPytest) && existsSync(venvUvicorn)) {
    console.log('Reusing existing AI dependencies in ai/.venv');
    return;
  }

  run(venvPython, ['-m', 'pip', 'install', '-e', '.[dev]'], { cwd: aiDir, env: aiEnv });
}

function maybeReindexKnowledge() {
  if (!shouldReindex) {
    console.log('\nSkipping knowledge reindex. Run `npm run setup -- --reindex` if you want to build the local vector index now.');
    return;
  }

  logStep('Reindexing local knowledge');
  run(venvPython, ['scripts/reindex_knowledge.py'], { cwd: aiDir, env: aiEnv });
}

function validateSetup() {
  if (!shouldValidate) {
    console.log('\nSkipping validation. Run `npm run setup -- --skip-validation` only when you want a faster bootstrap.');
    return;
  }

  logStep('Validating the web app');
  runNpm(['run', 'lint'], { cwd: rootDir });
  runNpm(
    [
      'exec',
      '--',
      'tsx',
      '--test',
      'app/api/rooms/python/feedback/route.test.ts',
      'src/features/rooms/__tests__/pyodide-runtime.test.ts',
    ],
    { cwd: rootDir },
  );

  logStep('Validating the Python AI service');
  run(venvPython, ['-m', 'pytest'], { cwd: aiDir, env: aiEnv });
}

function printNextSteps() {
  console.log('\nYantra setup completed.');
  console.log('\nNext manual steps:');
  console.log('- Fill in real secrets in .env.local and ai/.env.');
  console.log('- Apply supabase/schema.sql to your Supabase project.');
  console.log('- Start the web app with `npm run dev`.');
  console.log(`- Start the AI service with \`${venvPython} -m uvicorn main:app --reload --port 8000\` from the ai directory.`);
}

ensureRequirements();
ensureEnvFiles();
installWebDependencies();
ensurePythonEnvironment();
maybeReindexKnowledge();
validateSetup();
printNextSteps();
