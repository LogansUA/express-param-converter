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

##### Example with single instance convertation:
```javascript
var express = require('express');
var app = express();

var ExpressParamConverter = require('express-param-converter');

// Sequelize model
var Blog = require('./models/Blog');

app.get(
    '/blog/:id',
    [
        ExpressParamConverter.convert({ name: 'blog', model: Blog })
    ],
    function (res, req) {
        // Now you can easily access variables in `res.params`
        var blog = res.params.blog;

        return req.status(200).json({
            blog: blog,
        });
    }
);
```

##### This is how you can use multiple converters in one action:
```javascript
var express = require('express');
var app = express();

var ExpressParamConverter.convert = require('express-param-converter');

// Sequelize models
var Blog = require('./models/Blog');
var Post = require('./models/Post');

app.get(
    '/blog/:id/post/:post_slug',
    [
        ExpressParamConverter.convert({ name: 'blog', model: Blog }),
        ExpressParamConverter.convert({ name: 'post', model: Post, options: { mappings: { post_slug: 'slug' } } })
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
var express = require('express');
var app = express();

var ExpressParamConverter.convert = require('express-param-converter');

// Sequelize models
var Post = require('./models/Post');
var Comment = require('./models/Comment');

app.get(
    '/post/:post_slug/comment/:comment_id',
    [
        ExpressParamConverter.convert({ name: 'post', model: Post, options: { mappings: { post_slug: 'slug' }, plain: true } }),
        ExpressParamConverter.convert({ name: 'comment', model: Comment, options: { mappings: { comment_id: 'id' }, plain: true } })
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
- [x] Rewrite to typescript
- [ ] Make it independent from sequelize models
- [ ] Add additional parameters to options (i.e. `method` etc.)

License
----
This software is published under the [MIT License](LICENSE)
