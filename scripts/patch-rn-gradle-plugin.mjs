import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(
  process.cwd(),
  'node_modules/@react-native/gradle-plugin/settings.gradle.kts',
);
const trackPlayerPath = resolve(
  process.cwd(),
  'node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt',
);
const reanimatedGradlePath = resolve(
  process.cwd(),
  'node_modules/react-native-reanimated/android/build.gradle',
);
const workletsGradlePath = resolve(
  process.cwd(),
  'node_modules/react-native-worklets/android/build.gradle',
);
const mmkvGradlePath = resolve(
  process.cwd(),
  'node_modules/react-native-mmkv/android/build.gradle',
);
const nitroGradlePath = resolve(
  process.cwd(),
  'node_modules/react-native-nitro-modules/android/build.gradle',
);
const gestureHandlerGradlePath = resolve(
  process.cwd(),
  'node_modules/react-native-gesture-handler/android/build.gradle',
);

const before = 'version("0.5.0")';
const after = 'version("1.0.0")';

const source = readFileSync(filePath, 'utf8');
if (source.includes(before)) {
  writeFileSync(filePath, source.replace(before, after));
  console.log(
    '[postinstall] Patched React Native Gradle plugin Foojay resolver to 1.0.0.',
  );
} else if (source.includes(after)) {
  console.log('[postinstall] React Native Gradle plugin already patched.');
} else {
  console.warn(
    '[postinstall] Expected Foojay resolver version string was not found. Skipping patch.',
  );
}

const trackPlayerSource = readFileSync(trackPlayerPath, 'utf8');
const nullableTrackBundle = `callback.resolve(Arguments.fromBundle(musicService.tracks[index].originalItem))`;
const nullableActiveBundle = `else Arguments.fromBundle(
                musicService.tracks[musicService.getCurrentTrackIndex()].originalItem
            )`;

let nextTrackPlayerSource = trackPlayerSource;

if (nextTrackPlayerSource.includes(nullableTrackBundle)) {
  nextTrackPlayerSource = nextTrackPlayerSource.replace(
    nullableTrackBundle,
    `callback.resolve(
                musicService.tracks[index].originalItem?.let(Arguments::fromBundle)
            )`,
  );
}

if (nextTrackPlayerSource.includes(nullableActiveBundle)) {
  nextTrackPlayerSource = nextTrackPlayerSource.replace(
    nullableActiveBundle,
    `else musicService.tracks[musicService.getCurrentTrackIndex()].originalItem?.let(
                Arguments::fromBundle
            )`,
  );
}

if (nextTrackPlayerSource !== trackPlayerSource) {
  writeFileSync(trackPlayerPath, nextTrackPlayerSource);
  console.log('[postinstall] Patched react-native-track-player Kotlin bundle nullability.');
}

function patchCmakeStaging(filePath, name) {
  try {
    const source = readFileSync(filePath, 'utf8');
    const marker = 'version = System.getenv("CMAKE_VERSION") ?: "3.22.1"';
  const stagingLine = `            buildStagingDirectory = file("\${rootProject.projectDir}/.cxx/${name}")\n`;

  if (source.includes(stagingLine.trim())) {
    return false;
  }

  if (!source.includes(marker)) {
    console.warn(
      `[postinstall] Could not find CMake version marker for ${name}. Skipping staging patch.`,
    );
    return false;
  }

    writeFileSync(filePath, source.replace(marker, `${stagingLine}${marker}`));
    return true;
  } catch (e) {
    return false;
  }
}

function patchCmakePathStaging(filePath, name, pathLine) {
  try {
    const source = readFileSync(filePath, 'utf8');
    const stagingLine = `      buildStagingDirectory = file("\${rootProject.projectDir}/.cxx/${name}")\n`;

  if (source.includes(`.cxx/${name}`)) {
    return false;
  }

  if (!source.includes(pathLine)) {
    console.warn(
      `[postinstall] Could not find CMake path marker for ${name}. Skipping staging patch.`,
    );
    return false;
  }

    writeFileSync(filePath, source.replace(pathLine, `${stagingLine}${pathLine}`));
    return true;
  } catch (e) {
    return false;
  }
}

if (patchCmakeStaging(reanimatedGradlePath, 'reanimated')) {
  console.log('[postinstall] Patched react-native-reanimated CMake staging directory.');
}

if (patchCmakeStaging(workletsGradlePath, 'worklets')) {
  console.log('[postinstall] Patched react-native-worklets CMake staging directory.');
}

if (patchCmakePathStaging(mmkvGradlePath, 'mmkv', '      path "CMakeLists.txt"')) {
  console.log('[postinstall] Patched react-native-mmkv CMake staging directory.');
}

if (patchCmakePathStaging(nitroGradlePath, 'nitro', '      path "CMakeLists.txt"')) {
  console.log('[postinstall] Patched react-native-nitro-modules CMake staging directory.');
}

if (
  patchCmakePathStaging(
    gestureHandlerGradlePath,
    'gesture-handler',
    '                path "src/main/jni/CMakeLists.txt"',
  )
) {
  console.log('[postinstall] Patched react-native-gesture-handler CMake staging directory.');
}
