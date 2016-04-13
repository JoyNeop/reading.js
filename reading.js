var ReadingDotJs = {
	'currentReadingElementIndex': 0,
	'currentReadingElementOffsetVertical': Math.floor(window.innerHeight*0.8),
	'config': {
		'wordPersistDuration': 60/580,
		'seperationLineManipulation': 3,
		'sentenceEndManipulation': 3,
		'HeadingManipulation': 1,
		'selector': '_CC_ h1, _CC_ h2, _CC_ h3, _CC_ h4, _CC_ h5, _CC_ h6, _CC_ p, _CC_ blockquote'.replace(/_CC_/g, 'article .section-inner.layoutSingleColumn')
	}
};

ReadingDotJs.findAndParseAllReadableElements = function () {
	var inputElements = document.querySelectorAll(ReadingDotJs.config.selector);
	var parsedElements = [];
	var elementTextContent;

	for (var i = 0; i < inputElements.length; i++) {
		elementInnerTextArray = inputElements[i].innerText.split(' ').map(function (arrayItem) {
			return '<span class="JN--readingjs-word" data-readingjs-word-state="future">__CONTENT__</span>'.replace(/__CONTENT__/g, arrayItem);
		});
		parsedElements.push(('<__TAGNAME__>' + elementInnerTextArray.join(' ') + '</__TAGNAME__>').replace(/__TAGNAME__/g, inputElements[i].tagName.toLowerCase()));
	};

	return parsedElements.join('');
};

ReadingDotJs.initReaderView = function () {
	var _readerView = document.createElement('div');
	_readerView.innerHTML = '<div id="ReadingDotJs-reader-view--progress-bar"><div id="ReadingDotJs-reader-view--progress-bar--inner"></div></div><div id="ReadingDotJs-reader-view--content"></div>';
	_readerView.setAttribute('id', 'ReadingDotJs-reader-view');
	_readerView.setAttribute('data-tag-name', 'p');

	// Specify CSS
	var css = document.createElement('style');
	css.innerHTML = [
		'#ReadingDotJs-reader-view {',
			'font-family: Charter, "SF UI Display", -apple-system, "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", sans-serif;',
			'color: #000;',
			'background: #FFF;',
			'position: absolute;',
			'z-index: 99999;',
			'top: 0;',
			'left: 0;',
			'box-sizing: border-box;',
			'width: 100vw;',
			'height: auto;',
		'}',
		'.ReadingDotJs-time-count--container { position: fixed; top: 30px; left: 0; text-align: center; width: 100vw; }',
		'.ReadingDotJs-time-count { font-size: 16px; color: #999; display: inline-block; padding: 0 25px 0; text-transform: lowercase; }',
		'.ReadingDotJs-time-count--inner { font-size: 28px; color: #666; display: block; }',
		'#ReadingDotJs-reader-view--progress-bar { position: fixed; top: 0; left: 0; width: 100vw; height: 10px; }',
		'#ReadingDotJs-reader-view--progress-bar--inner { background: #05BDF8; width: 1px; height: 5px; -webkit-transition: all _DELAY_ms ease; transition: all _DELAY_ms ease;}'.replace(/_DELAY_/g, ReadingDotJs.config.wordPersistDuration*1000),
		'#ReadingDotJs-reader-view--content { max-width: 660px; margin: 20px auto; }',
		'#ReadingDotJs-reader-view--content h1, #ReadingDotJs-reader-view--content h2, #ReadingDotJs-reader-view--content h3, #ReadingDotJs-reader-view--content h4, #ReadingDotJs-reader-view--content h5, #ReadingDotJs-reader-view--content h6 { font-family: "Myriad Pro", Seravek, -apple-system, sans-serif; }',
		'#ReadingDotJs-reader-view--content h1 { font-size: 70px; font-weight: 800; }',
		'#ReadingDotJs-reader-view--content h2 { font-size: 60px; font-weight: 800; }',
		'#ReadingDotJs-reader-view--content h3 { font-size: 55px; font-weight: 600; }',
		'#ReadingDotJs-reader-view--content h4 { font-size: 45px; font-weight: 300; }',
		'#ReadingDotJs-reader-view--content h5 { font-size: 30px; font-weight: 300; }',
		'#ReadingDotJs-reader-view--content h6 { font-size: 30px; font-weight: 200; }',
		'#ReadingDotJs-reader-view--content p { font-size: 30px; font-weight: 400; }',
		'#ReadingDotJs-reader-view--content span.JN--readingjs-word { transition: all 180ms ease; }',
		'#ReadingDotJs-reader-view--content span.JN--readingjs-word[data-readingjs-word-state="past"] { color: #333; border-bottom: 3px solid #FFF; }',
		'#ReadingDotJs-reader-view--content span.JN--readingjs-word[data-readingjs-word-state="present"] { color: #333; border-bottom: 3px solid #FFF; }',
		'#ReadingDotJs-reader-view--content span.JN--readingjs-word[data-readingjs-word-state="future"] { color: #BBB; border-bottom: 3px solid #FFF; }',
		'#ReadingDotJs-reader-view--content blockquote { font-size: 20px; font-weight: 400; font-style: italic; }',
		'@media screen and (max-width: 1000px) {',
			'.ReadingDotJs-time-count--container { display: none; }',
			'#ReadingDotJs-reader-view--content { margin-left: 10vw; }',
		'}'
	].join('');
	document.head.appendChild(css);

	// document.body.innerHTML = '';
	document.body.appendChild(_readerView);
};

ReadingDotJs.go = function (msg) {
	if (!msg) {
		msg = {};
	};
	if (!msg.hasOwnProperty('force') && document.querySelectorAll('meta[name="ReadingDotJs-exmaple"]').length !== 0) {
		return 123;
	};

	['wordPersistDuration', 'selector'].map(function (prop) {
		if (localStorage['JN--ReadingDotJs.config.' + prop]) {
			ReadingDotJs.config[prop] = localStorage['JN--ReadingDotJs.config.' + prop];
		};
		if (msg.hasOwnProperty(prop)) {
			ReadingDotJs.config[prop] = msg[prop];
		};
	});

	ReadingDotJs.initReaderView();
	document.getElementById('ReadingDotJs-reader-view--content').innerHTML = ReadingDotJs.findAndParseAllReadableElements();

	ReadingDotJs.updatingService = window.setInterval(function(){
		var currentWord = document.querySelectorAll('.JN--readingjs-word')[ReadingDotJs.currentReadingElementIndex];
		if (ReadingDotJs.currentReadingElementIndex !== 0) {
			document.querySelectorAll('.JN--readingjs-word')[ReadingDotJs.currentReadingElementIndex-1].setAttribute('data-readingjs-word-state', 'past');
		};
		currentWord.setAttribute('data-readingjs-word-state', 'present');

		if (currentWord.offsetTop >= window.innerHeight*0.4 && currentWord.offsetTop > ReadingDotJs.currentReadingElementOffsetVertical) {
			console.log(103);
			window.scrollTo(0, currentWord.offsetTop - window.innerHeight*0.4);
			ReadingDotJs.currentReadingElementOffsetVertical = currentWord.offsetTop;
		};

		ReadingDotJs.currentReadingElementIndex += 1;

		// Move progress bar
		document.getElementById('ReadingDotJs-reader-view--progress-bar--inner').style.width = (ReadingDotJs.currentReadingElementIndex/document.querySelectorAll('.JN--readingjs-word').length*100) + '%';

		if (ReadingDotJs.currentReadingElementIndex >= document.querySelectorAll('.JN--readingjs-word').length) {
			window.clearInterval(ReadingDotJs.updatingService);
		};
	}, ReadingDotJs.config.wordPersistDuration*1000);
};

ReadingDotJs.go({});
