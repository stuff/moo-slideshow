/* global $ */

var MyApp = (function () {
    
    'use strict';

    var app = {};

    app.start = function () {
        var container = $('slideshow-container');

        // Data from dom
        app.slideShow = new app.SlideShow({
            data: container
        });
        app.slideShow.inject(container);


/*        // Async Data
        app.getData(function (data) { // callback, for when we'll use ajax to fetch data
            app.slideShow = new app.SlideShow({
                data: data
            });
            app.slideShow.inject($('slideshow-container').empty());
        }); */

    };

    app.getData = function (callback) {
        var data = [
            {
                imageSrc: 'img/img01.jpg',
                imageBg: 'img/back01.jpg',
                link: 'http://www.google.com',
                title: 'Starcraft title 1',
                text: '<p>Et olim licet otiosae sint tribus pacataeque centuriae et nulla suffragiorum certamina set Pompiliani redierit securitas temporis, per omnes tamen quotquot sunt partes terrarum, ut domina suscipitur et regina et ubique patrum reverenda cum auctoritate canities populique Romani nomen circumspectum et verecundum.</p><p>Ego vero sic intellego, Patres conscripti, nos hoc tempore in provinciis decernendis perpetuae pacis habere oportere rationem. Nam quis hoc non sentit omnia alia esse nobis vacua ab omni periculo atque etiam suspicione belli?</p>'
            },

            {
                imageSrc: 'img/img02.jpg',
                imageBg: 'img/back02.jpg',
                link: 'http://www.yahoo.fr',
                title: 'Starcraft title 2',
                text: '<p>Et olim licet otiosae sint tribus pacataeque centuriae et nulla suffragiorum certamina set Pompiliani redierit securitas temporis, per omnes tamen quotquot sunt partes terrarum, ut domina suscipitur et regina et ubique patrum reverenda cum auctoritate canities populique Romani nomen circumspectum et verecundum.</p><p>Ego vero sic intellego, Patres conscripti, nos hoc tempore in provinciis decernendis perpetuae pacis habere oportere rationem. Nam quis hoc non sentit omnia alia esse nobis vacua ab omni periculo atque etiam suspicione belli?</p>'
            },

            {
                imageSrc: 'img/img03.jpg',
                imageBg: 'img/back03.jpg',
                title: 'Starcraft title 3',
                text: '<p>blahblah</p>'
            },

            {
                imageSrc: 'img/img04.jpg',
                imageBg: 'img/back04.jpg',
                title: 'Starcraft title 4',
                text: '<p>blahblah</p>'
            }

        ];
        callback(data);
    };

    return app;
}());

window.addEvent('domready', function() {
    'use strict';
    MyApp.start();
});

