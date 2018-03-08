var express = require('express'),
    router = express.Router({mergeParams: true}),
    PLNews = require('../models/plnews'),
    Comment = require('../models/comment'),
    middleware = require('../middleware');

router.get('/premire-league/news/:id/comments/new', middleware.isLoggedIn, function (req, res){
    // FIND NEWS by ID
    PLNews.findById(req.params.id, function(err, news){
        if(err){
            console.log(err);
        } else {
            res.render('add-comment', {plNews: news});
        }
    });
});

router.post('/premire-league/news/:id/comments', middleware.isLoggedIn, function(req, res){
    PLNews.findById(req.params.id, function(err, news){
        if (err){
            console.log(err);
            res.redirect('back');
        } else {
            Comment.create(req.body.comment, function (err, comment){
                if (err){
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    news.comments.push(comment);
                    news.save();
                    res.redirect('/premire-league/news/' + news._id);
                }
            });
        }
    });
});

// COMMENTS EDIT ROUTE
router.get('/premire-league/news/:newsID/comments/:comment_id/edit',middleware.isLoggedIn,  middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("edit-comments", {news_id: req.params.newsID, comment: foundComment});
        }
    })
})

router.put("/premire-league/news/:newsID/comments/:comment_id" ,middleware.isLoggedIn, middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
        if(err){
            res.redirect('back');
        } else {
            res.redirect("/premire-league/news/" + req.params.newsID);
        }
    });
});

router.delete('/premire-league/news/:newsID/comments/:comment_id', middleware.isLoggedIn, middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect('back');
        } else {
            res.redirect("/premire-league/news/" + req.params.newsID);
        }
    })
})

module.exports = router;