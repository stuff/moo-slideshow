/* global Class, Events, Options, typeOf */

(function (app) {
    'use strict';

    app.SlideShow = new Class({
        Implements: [Events, Options],
        options: {
            data: [],
            scrollDelay: 5000,
            tabindex: 0
        },

        // index of the slide to show
        index: null,
        
        // mouse pointer is within the area, or not
        focused: false,
        
        // scroll timeout handler
        timeoutScroller: null,

        elements: {
            // root element
            container : null,

            // buttons for fast slide
            bottomPager: null,

            // pagination arrows
            leftArrow: null,
            rightArrow: null,

            slides: []
        },

        initialize: function(options){
            this.setOptions(options);
            
            // root element
            this.elements.container = new Element('div', {
                'class': 'slideshow',
                tabindex: options.tabindex
            });

            if (typeOf(options.data) === 'element') {
                this.grabSlidesFromElement(options.data);
            }

            this.buildSkeleton();
            this.attachEvents();

            this.goToSlide(0);

            this.startAutoScroll();
        },

        // fill our slide elements cache with elements from dom
        // parse elements to fill internal data
        grabSlidesFromElement: function (element) {
            var self = this,
                newData = [],
                slides = element.getElements('.slideshow-slide');

            slides.forEach(function (slide, n) {
                var link = slide.getElement('.read-more'),

                    data = {
                        imageSrc: slide.getElement('.slideshow-image').get('src'),
                        imageBg: slide.getStyle('background-image').match(/url\((.*)\)/)[1],
                        title: slide.getElement('h1').get('html').trim(),
                        text: slide.getElement('.slideshow-content').get('html').trim(),
                        link: link ? link.get('href') : null
                    };

                if (link) {
                    link.destroy();
                }

                newData[n] = data;

                self.elements.slides[n] = slide;
                slide.setStyle('position', 'absolute');
            });

            this.options.data = newData;
        },

        autoScrollFn: function () {
            if (!this.focused) {
                this.goToSlide(this.index + 1);
                this.startAutoScroll();
            }
        },

        startAutoScroll: function () {
            clearTimeout(this.timeoutScroller);
            this.timeoutScroller = this.autoScrollFn.delay(this.options.scrollDelay, this);
        },
        
        // build basic skeleton of the slideshow
        buildSkeleton: function () {
            var elements = this.elements;

            // pager elements
            elements.bottomPager = new Element('nav', {
                'class': 'slideshow-pager'
            }).grab(new Element('ul'));

            this.options.data.forEach(function (slide, n) {
                var elm = new Element('li', {
                        html: '<a title="' + slide.title + '"><span>' + slide.title + '</span></a>'
                    });
                elm.store('index', n);
                elm.inject(elements.bottomPager.getElement('ul'));
            });

            elements.bottomPager.inject(elements.container);

            // left/right navigation
            elements.leftArrow = new Element('a', {
                'class': 'slideshow-arrow left-arrow',
                html: '<span></span>'
            }).inject(elements.container);

            elements.rightArrow = new Element('a', {
                'class': 'slideshow-arrow right-arrow',
                html: '<span></span>'
            }).inject(elements.container);
        },
        
        attachEvents: function () {
            var self = this,
                container = this.elements.container;

            container.addEvents({

                'click:relay(.slideshow-slide)': this.onOpenMainLink.bind(this),

                'click:relay(.slideshow-arrow)': this.onArrowClick.bind(this),

                'click:relay(.slideshow-pager li)': this.onPagerClick.bind(this),

                mouseenter: function () {
                    container.fireEvent('focus');
                },

                mouseleave: function () {
                    container.fireEvent('blur');
                }, 
                
                keyup: function (event) {
                    if (event.key === 'right') {
                        self.goToSlide(self.index + 1);
                    } else if (event.key === 'left') {
                        self.goToSlide(self.index - 1);
                    } else if (event.key === 'enter') {
                        self.onOpenMainLink();
                    }
                },

                focus: this.onFocus.bind(this),

                blur: this.onBlur.bind(this)
            });
        },

        onFocus: function () {
            this.focused = true;

            // make sure our scroller is stopped
            clearTimeout(this.timeoutScroller);
        },

        onBlur: function () {
            this.focused = false;
            this.startAutoScroll();
        },

        onPagerClick: function (e, target) {
            var index = target.retrieve('index');
             this.goToSlide(index);
        },

        onArrowClick: function (e, target) {
            if (target.hasClass('left-arrow')) {
                this.goToSlide(this.index - 1);
            } else if (target.hasClass('right-arrow')) {
                this.goToSlide(this.index + 1);
            }
        },
        
        onOpenMainLink: function () {
            var current = this.options.data[this.index];
            if (current.link) {
                window.open(current.link);
            }
        },

        goToSlide: function (slideIndex) {
            var newSlide,
                max = this.options.data.length - 1,
                elements = this.elements,
                direction = (slideIndex > this.index) ? -1 : 1,
                mainSlide = elements.container.getElement('div.current'),
                slideWidth = mainSlide ? mainSlide.getSize().x : null;

            // first slide case
            if (this.index === null) {
                this.getSlide(slideIndex).addClass('current').inject(elements.container, 'top');
                this.index = slideIndex; // init index
                this.setSelectedPage(slideIndex);
                return;
            }
            
            // ignore goToSlide if currently sliding OR wanting to show the same currently displayed slide
            if (mainSlide.get('tween').isRunning() || slideIndex === this.index) {
                return;
            }

            // loop sliding
            if (slideIndex < 0) {
                slideIndex = max;
            } else if (slideIndex > max) {
                slideIndex = 0;
            }

            newSlide = this.getSlide(slideIndex);
            newSlide.inject(elements.container, 'top');

            mainSlide.removeClass('current');
            newSlide.addClass('current');

            // slide both new and old slide in the right direction
            mainSlide.tween('left', 0, direction * slideWidth);
            newSlide.tween('left', (-direction) * slideWidth, 0);

            this.index = slideIndex;
            this.setSelectedPage(slideIndex);
        },

        setSelectedPage: function (slideIndex) {
            var pager = this.elements.bottomPager,
                page = pager.getElements('li')[slideIndex];

            // remove class from previous
            pager.getElements('.current').removeClass('current');

            // add class to new current
            page.addClass('current');
        },

        getSlide: function (slideIndex) {
            var ret, title, content, image, container, article,
                data = this.options.data[slideIndex];

            if (this.elements.slides[slideIndex]) {
                ret = this.elements.slides[slideIndex];
            } else {

                title = new Element('h1', {
                    text: data.title
                });

                content = new Element('div', {
                    'class': 'slideshow-content',
                    html: data.text
                });

                image = new Element('img', {
                    'class': 'slideshow-image',
                    title: data.title,
                    src: data.imageSrc
                });

                container = new Element('div', {
                    'class': 'slideshow-slide',
                    styles: {
                        background: 'url(' + data.imageBg + ')',
                        position: 'absolute'
                    }
                });

                article = new Element('article');

                image.inject(article);
                title.inject(article);
                content.inject(article);

                container.set('tween', {
                    duration: 500,
                    transition: 'quad:out'
                });
            
                this.elements.slides[slideIndex] = container;

                ret = container.grab(article);
            }

            // this slide has a main link
            if (data.link) {
                ret.addClass('has-link');
            }

            return ret.setStyle('position', 'absolute');
        },

        inject: function(targetElement) {
            this.elements.container.inject(targetElement);
        }
    });
}(MyApp));