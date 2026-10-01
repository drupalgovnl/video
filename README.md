# Video
An easy to use video library. There are build-in plugins, but you can add your
own. See 'plugin.js' for more information.

## How to use it
You can use it as a module or just include it via the script tag. A demo is
included in `/demo`.

### Module bundler
```
import Video from '@dictu/video';
```

### Browser
```
<script src="dist/video.min.js"></script>
```

## Build
Install the dependencies and generate the files in `dist` before running the
demo locally:

```sh
npm ci
npm run build
```

The following commands can be used:
```
build       - Compile and minify js.
compile     - Compile js.
minify      - Minify js.
lint        - Lint js file.
```
