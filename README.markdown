Shortly
=======

Shortly is a Safari extension that helps getting showtlinks to webpages in just one click. Shortly also tries to support native shortlinks like `youtu.be`, `flic.kr` or `git.io`. For more information please visit http://zzhc.org/shortly/

You can install Shortly from Apple's Safari Extension Gallery or from our website listed above.


Building your own Shortly
-------------------------

The source code of Shortly hosted on GitHub does not come with API keys for Google URL Shortener and Bitly. If you want to build your own copy of Shortly, please follow the instructions:

  1. Find `api-keys.template.js` in `source/`.
  2. Fill in your API keys or access token, and rename it to `api-keys.js`.
  3. Run `npm install`, and then `gulp build`.
  4. You should be able to find a `Shortly.safariextension/` folder under `build/`.
  5. Import it to your Safari Extension Builder and happy building!


License
-------
The source code of Shortly is licensed under MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
