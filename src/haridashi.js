define(function (require) {

    var haridashi = {};

    haridashi.isObject = function(obj) {
            var type = typeof obj;
            return type === 'object' && !!obj;
    };

    haridashi.extend = function(obj) {
        if (!haridashi.isObject(obj)) return obj;
        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];

            for (prop in source) {
                // if we are copying over functions lets extend the original function
                if(typeof obj[prop] == 'function' && typeof source[prop] == 'function') {

                    //closure ref
                    (function(_objFunc, _sourceFunc){
                         //set the obj function
                         obj[prop] = function(){
                            var thisFunc = haridashi.bind(_sourceFunc, this);
                            var inherited = _objFunc

                            var _arguments = [inherited].concat(arguments);

                            thisFunc.apply(this, _arguments);
                         }

                    }(obj[prop],
                      source[prop]))

              } else {
                    obj[prop] = typeof obj[prop] != 'undefined' ? obj[prop] : source[prop];
              }
            }
        }

        return obj;
    };

    haridashi.ready = function(func) {
        //checks to see if mixins have been loaded from require, and if the control is ready
        var readyStateCheckInterval = window.setInterval(function () {
            //attach a ready state listener to fire off our first updates when the dom is available
            if (document.readyState === 'complete') {
                window.clearInterval(readyStateCheckInterval);
                func();
            }
        }, 10);
    };

    haridashi.bind = function (func, context) {
            //return an error to the callee class when used
            if(!func) {return func};
            //bind function ripped from underscore, changes the scope of this inside func to context
            var ArrayProto = Array.prototype,
                FuncProto = Function.prototype,
                slice = ArrayProto.slice,
                nativeBind = FuncProto.bind;
            var args, bound;
            if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
            args = slice.call(arguments, 2);
            return bound = function () {
                if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
                ctor.prototype = func.prototype;
                var self = new ctor;
                ctor.prototype = null;
                var result = func.apply(self, args.concat(slice.call(arguments)));
                if (Object(result) === result) return result;
                return self;
            };
    };

	haridashi.htmlDecode = function(input){
	  var e = document.createElement('div');
	  e.innerHTML = input;
	  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
	};

    var templatecache = {};
    haridashi.template = function tmpl(str, data){

		var fn = !/\W/.test(str) ?
          templatecache[str] = templatecache[str] ||
            tmpl(document.getElementById(str).innerHTML) :

          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str
		      .replace(/&amp;/g, "&")
			  .replace(/&lt;/g, "<")
			  .replace(/&gt;/g, ">")
			  .replace(/&quot;/g, "\"")
			  .replace(/&#039;/g, "'")
              .replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };

    return haridashi;
});