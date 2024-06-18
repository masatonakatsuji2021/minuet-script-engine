# minuet-script-engine
A highly functional, simple and fast template engine. Intended as an alternative to PHP.

## # The easiest way to run a script

The ``index.ts`` file should look like this:.
(``sample.mse`` is the Mse script file to be executed)

```javascript
import { Mse } from "minuet-script-engine";

// Instantiate the Mse class
const mse = new Mse();

(async () => {
    // Load the sample.mse file and run it as a script.
    const content = await mse.file("sample.mse");
    // Display the results in the console
    console.log(content);
})();
```

The code for ``sample.mse`` is as follows:  
The area enclosed by ``<script mse>`` and ``</script>`` is the script area, and this range behaves as a script.

```html
Hallo World!

<script mse>
const d = new Date();
echo(d.getTime());
</script>

Welcome!
```

If you run this, you will get output similar to the following  :
(```echo(d.getTime());`` displays the current UNIX timestamp.)

## # When the root directory is specified

Deploy on a web server using the http module etc.  
In that case, you need to place the root directory and a set of script files inside it in advance.
(If no options are specified for an instance,  
the ``htdocs`` directory will be the root directory.)

```typescript
import { Mse } from "minuet-script-engine";
import * as http from "http";

// Instantiate the Mse class
const mse = new Mse();

// Server Listen
const h = http.createServer(async (req, res) => {
    // Mse Listen....
    await mse.listen(req, res);
});
h.listen(8080);
```

## # Specifying options

```typescript
import { Mse } from "minuet-script-engine";
import * as http from "http";

// Instantiate the Mse class
const mse = new Mse({
    // rootDir
    rootDir : "www",
    // Error screen when an error occurs.
    pages: {
        // 404 Not Found
        notFound: "error/404.mse",
        // 500 Internal Server Error
        InternalError: "error/500.mse",
    },
    // Use Modules
    modules: [
        "http",
        "file",
        "text",
    ],
    // Use Module Option
    moduleOptions: {
        // file module option
        file: {
            // temporary directory
            tempDir: "temp",
        },
    }
});

// Server Listen
const h = http.createServer(async (req, res) => {
    // Mse Listen....
    await mse.listen(req, res);
});
h.listen(8080);
```
