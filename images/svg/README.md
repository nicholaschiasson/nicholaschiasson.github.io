# SVG image uploads
Include an empty ```<defs></defs>``` tag in SVG images so that styles can be
added to them by the document element which loads them. This is done on window
load and applies to all elements with the class "svg-img".
