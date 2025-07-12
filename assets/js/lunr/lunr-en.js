---
layout: none
---

var idx = lunr(function () {
  this.field('title')
  this.field('excerpt')
  this.field('categories')
  this.field('tags')
  this.ref('id')

  this.pipeline.remove(lunr.trimmer)

  for (var item in store) {
    this.add({
      title: store[item].title,
      excerpt: store[item].excerpt,
      categories: store[item].categories,
      tags: store[item].tags,
      id: item
    })
  }
});

$(document).ready(function() {
  $('input#search').on('keyup', function () {
    var resultdiv = $('#results');
    var query = $(this).val().toLowerCase();
    var result =
      idx.query(function (q) {
        query.split(lunr.tokenizer.separator).forEach(function (term) {
          q.term(term, { boost: 100 })
          if(query.lastIndexOf(" ") != query.length-1){
            q.term(term, {  usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 })
          }
          if (term != ""){
            q.term(term, {  usePipeline: false, editDistance: 1, boost: 1 })
          }
        })
      });
    resultdiv.empty();
    resultdiv.prepend('<p class="results__found">'+result.length+' {{ site.data.ui-text[site.locale].results_found | default: "Result(s) found" }}</p>');
    for (var item in result) {
      var ref = result[item].ref;
      var teaser_html = "";

      // new logik: check for spotify embeded
      if (store[ref].spotify) {
        teaser_html = `
          <div class="archive__item-teaser">
            <div class="spotify-embed-wrapper">
              ${store[ref].spotify}
            </div>
          </div>`;
      } else if (store[ref].teaser) {
        // fallback teaser image
        teaser_html = `
          <div class="archive__item-teaser">
            <img src="${store[ref].teaser}" alt="">
          </div>`;
      }

      var searchitem = `
        <div class="list__item">
          <article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">
            <h2 class="archive__item-title" itemprop="headline">
              <a href="${store[ref].url}" rel="permalink">${store[ref].title}</a>
            </h2>
            <div class="archive__item-content">
              ${teaser_html}
              <div class="archive__item-excerpt">
                <p itemprop="description">${store[ref].excerpt.split(" ").splice(0, 20).join(" ")}...</p>
              </div>
            </div>
          </article>
        </div>`;

      resultdiv.append(searchitem);
    }
  });
});
