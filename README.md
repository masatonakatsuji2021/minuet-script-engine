# minuet-script-engine
A highly functional, simple and fast template engine. Intended as an alternative to PHP.

## # The easiest way to run a script

The ``index.ts`` file should look like this:.
(``sample.mse`` is the Mse script file to be executed)

```javascript
import { Mse  } from "minuet-script-engine";

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

```php
Hallo World!
<?
const d = new Date();
echo(d.getTime());
?>
```

If you run this, you will get output similar to the following  :
(```echo(d.getTime());`` displays the current UNIX timestamp.)

