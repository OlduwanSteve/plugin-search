var lunr = require('lunr');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

// Create search index
var searchIndex = lunr(function () {
    this.ref('url');

    this.field('title', { boost: 10 });
    this.field('body');
});

module.exports = {
    book: {
        assets: './assets',
        js: [
            'lunr.min.js', 'search.js'
        ]
    },

    hooks: {
        // Index each page
        "page": function(page) {
            if (this.options.generator != 'website') return page;

            this.log.debug.ln('index page', page.path);

            // Extract HTML
            var html = _.pluck(page.sections, 'content').join(' ');

            // Transform as TEXT
            var text = html.replace(/(<([^>]+)>)/ig, '');

            // Add to index
            searchIndex.add({
                url: this.contentLink(page.path),
                title: page.progress.current.title,
                body: text
            });

            return page;
        },

        // Write index to disk
        "finish": function() {
            if (this.options.generator != 'website') return;

            this.log.debug.ln('write search index');
            fs.writeFileSync(
                path.join(this.options.output, "search_index.json"),
                JSON.stringify(searchIndex)
            );
        }
    }
};

