﻿/*
* Responsive Dropdown v1.0.0
*/

/*global jQuery*/
(function ($) {

    "use strict";

    // General variables.
    var supportTransition = $.support.transition,

    // The Dropdown object that contains our methods.
        Dropdown = function (element, options) {

            this.$element = $(element);
            this.options = $.extend({}, $.fn.dropdown.defaults, options);
            this.$parent = null;
            this.transitioning = null;

            if (this.options.parent) {
                this.$parent = this.$element.parents(this.options.parent + ":first");
            }

            // Check to see if the plug-in is set to toggle and trigger 
            // the correct internal method if so.
            if (this.options.toggle) {
                this.toggle();
            }

        };

    // Assign public methods via the Dropdown prototype.
    Dropdown.prototype = {

        constructor: Dropdown,
        show: function () {

            if (this.transitioning || !this.$element.hasClass("collapse")) {
                return;
            }

            var dimension = this.options.dimension,
                scroll = $.camelCase(["scroll", dimension].join("-")),
                actives = this.$parent && this.$parent.find(".dropdown-group:not(.collapse)"),
                hasData;

            if (actives && actives.length) {
                hasData = actives.data("dropdown");
                actives.dropdown("hide");

                if (!hasData) {
                    actives.data("dropdown", null);
                }
            }

            // Set the height/width to zero then to the scroll height/width
            // so animation can take place.
            this.$element[dimension](0);
            this.$element[dimension](this.$element[0][scroll]);
            this.transition("removeClass", $.Event("show"), "shown");
        },
        hide: function () {

            if (this.transitioning || this.$element.hasClass("collapse")) {
                return;
            }

            // Reset the height/width and then reduce to zero.
            var dimension = this.options.dimension;
            this.reset(this.$element[dimension]());
            this.transition("addClass", $.Event("hide"), "hidden");
            this.$element[dimension](0);
        },
        reset: function (size) {

            // Reset the size of the hidden element.
            var dimension = this.options.dimension;
            this.$element.removeClass("expand")
                         [dimension](size || "auto")
                         [0].offsetWidth; // Force reflow 

            return this;
        },
        transition: function (method, startEvent, completeEvent) {
            var self = this,
                complete = function () {
                    // The event to expose.
                    var eventToTrigger = $.Event(completeEvent + ".dropdown.responsive");

                    if (startEvent.type === "show") {
                        // Reset to allow animation to continue.
                        self.reset();
                    }

                    self.transitioning = false;
                    self.$element.trigger(eventToTrigger);
                };

            if (startEvent.isDefaultPrevented()) {
                return;
            }

            self.transitioning = true;

            // Remove or add the expand classes.
            this.$element.trigger(startEvent)[method]("collapse");
            this.$element[startEvent.type === "show" ? "addClass" : "removeClass"]("expand");

            if (supportTransition) {
                this.$element.one(supportTransition.end, complete);
            } else {
                complete();
            }

        },
        toggle: function () {
            // Run the correct command based on the presence of the class 'collapse'.
            this[this.$element.hasClass("collapse") ? "show" : "hide"]();
        }

    };

    /* Plugin definition */
    $.fn.dropdown = function (options) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data("dropdown"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("dropdown", (data = new Dropdown(this, opts)));
            }

            // Run the appropriate function if a string is passed.
            if (typeof options === "string") {
                data[options]();
            }

        });

    };

    // Define the defaults.
    $.fn.dropdown.defaults = {
        toggle: true,
        dimension: "height"
    };

    // Set the public constructor.
    $.fn.dropdown.Constructor = Dropdown;

    // Dropdown data api initialization.
    $(function () {
        $(document.body).on("click.dropdown.responsive", ":attrStart(data-dropdown)", function (event) {

            event.preventDefault();

            var $this = $(this),
                data = $this.data("dropdownOptions"),
                options = data || $.buildDataOptions($this, {}, "dropdown"),
                target = options.target || (options.target = $this.attr("href")),
                $target = $(target),
                params = $target.data("dropdown") ? "toggle" : options;

            // Run the dropdown method.
            $target.dropdown(params);

        });
    });
}(jQuery));