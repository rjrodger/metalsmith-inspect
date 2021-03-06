var util = require('util');

module.exports = inspect;

/**
 * Metalsmith plugin that prints the objects
 *
 * @param {Object} opts
 * @return {Function}
 */

function inspect(options){
   options = normalize(options);

   return function(files, metalsmith, done) {

      if (options.disable)
      return done();

      //try {
         var bigJSObject = {};

         if (options.includeMetalsmith) {
            bigJSObject[options.includeMetalsmith] = metalsmith.metadata();
         }

         Object.keys(files).forEach(function(filePath){
            var inData = files[filePath];

            if (options.fileFilter(filePath, inData, metalsmith)) {
               var outData = {};
               Object.keys(inData).forEach(function(key) {
                  if (options.accept(key, inData)) {
                     outData[key] = inData[key];
                  }
               });

               if (!options.contentsAsBuffer && outData.contents)
               outData.contents = inData.contents.toString();

               bigJSObject[filePath] = outData;
            }

         });

         options.printfn(bigJSObject);
         done();

   //   }
   //   catch (err) {
   //      done(err);
   //   }
  };

/**
 * Normalize an `options` dictionary.
 *
 * @param {Object} options
 */

 function normalize(options){
    options = options || {};

    options.printfn = options.printfn || function(obj) {
      console.dir(obj, {colors: true});
    };

   if (!options.accept) {
      if (options.include) {
         options.accept = function(propKey) { return options.include.indexOf(propKey) >= 0; };
      }
      else if (options.exclude){
         options.accept = function(propKey) { return options.exclude.indexOf(propKey) < 0; };
      }
      else {
         options.accept = function() { return true; };
      }
   }

   options.fileFilter = fileFilter(options.filter);

   return options;
};


/* calculate file filter function */
function fileFilter(filter) {
  if (filter) {
     if (typeof filter === 'string') {
        var regex = new RegExp(filter);
        return function(filePath) { return regex.test(filePath); }
     }
     else if (filter instanceof RegExp)
        return function(filePath) { return filter.test(filePath); }
     else {   // must be a function itself
        return filter;
     }
   }
   else  // none, return "pass all"
      return function() { return true; };
}



}
