# Express param converter middleware

**Note:** This param convertor currently works only with sequelize models. 

Inspired by [sensio/framework-extra-bundle](https://github.com/sensiolabs/SensioFrameworkExtraBundle) (@ParamConverter) 

Installation
----

```console
npm install express-param-converter --save
```

Usage
----

##### Example with single instance convertion:
```javascript
var modelParamConverter = require('express-param-converter');

var express = require('express');
var app = express();

// Sequelize models
var Blog = require('./models/Blog');

app.get('/blog/:id', [modelParamConverter({ name: 'blog', model: Blog })], function (res, req) {
    // Now you can easily access variables in `res.params`
    var blog = res.params.blog;

    return req.status(200).json({
        blog: blog,
    });
});
```

##### This is how you can use multiple converters in one action:
```javascript
var modelParamConverter = require('express-param-converter');

var express = require('express');
var app = express();

// Sequelize models
var Post = require('./models/Post');

app.get(
    '/blog/:id/post/:slug',
    [
        modelParamConverter({ name: 'blog', model: Blog }),
        modelParamConverter({ name: 'post', model: Post, options: { mappings: { slug: 'slug' } } })
    ],
    function (res, req) {
        // Note that `res.params` now contains `id`, `slug`, `blog` and `post` variables
        var blog = res.params.blog;
        var post = res.params.post;

        return req.status(200).json({
            blog: blog,
            post: post,
        });
    }
);
```

##### If you want to receive plain object you can use **plain** option
```javascript

var modelParamConverter = require('express-param-converter');

var express = require('express');
var app = express();

// Sequelize models
var Post = require('./models/Post');
var Comment = require('./models/Comment');

app.get(
    '/post/:slug/comment/:id',
    [
        modelParamConverter({ name: 'post', model: Post, options: { mappings: { slug: 'slug' }, plain: true } }),
        modelParamConverter({ name: 'comment', model: Comment })
    ],
    function (res, req) {
        var post = res.params.post;
        var comment = res.params.comment;
        
        // `plain` option do the same as:
        var plainComment = comment.get({ plain: true });

        return req.status(200).json({
            post: post,
            comment: plainComment,
        });
    }
);
```

TODO
----
- [ ] Rewrite to typescript 
- [ ] Make it independent from sequelize models 
- [ ] Add additional parameters to options (i.e. `method` etc.) 

License
----
This software is published under the [MIT License](LICENSE)
