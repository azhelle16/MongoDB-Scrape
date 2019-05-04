//Load required packages
require("dotenv").config();
var express = require("express")
var mongo = require("mongojs")
var request = require("request")
var cheerio = require("cheerio")
var axios = require("axios")
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var app = express();

//PORT Flexibility Declaration
var port = process.env.PORT || 3000

//Initialize Express
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// set the view engine to ejs
app.set('view engine', 'ejs');

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];
var db 

// Hook mongojs configuration to the db variable
if(process.env.MONGODB_URI) {
	db = mongoose.connect(process.env.MONGODB_URI);
} else {
	db = mongo(databaseUrl, collections);
}
	
db.on("error", function(error) {
	console.log("Database Error:", error);
});

app.get("/", function(req,res) {
	//res.render("pages/index")
	res.redirect("/fetchArticle")
})

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  
  // Make a request via axios for the news section of `the onion`
  axios.get("https://www.theonion.com/c/news-in-brief").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".headline").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element

      var title = $(element).children("a").children("div").text();
      var link = $(element).children("a").attr("href");
      var sum = $(element).next().next().children("p").text()

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link,
          summary: sum
        },
        function(err, inserted) {
          if (err) {
	        	// Log the error if one is encountered during the query
	       		res.json({error:err})
          }
          else {
              	// Send a "Scrape Complete" message to the browser
  				
          }
        });
      }
    });

    res.redirect("/fetchArticle")

  });

});

app.get("/fetchArticle",function(req,res) {

	//find articles
	db.scrapedData.find({},function(error, news){
		if(error) {
		  console.log(error)
		} else {
			var o = {news:news}
			res.render("pages/index",o)
	  	  }
	});

})

app.get("/check/:id", function(req,res) {

	//find articles by id
	db.saved.findOne({
	  article_id: req.params.id
	}, function(error, oneArticle) {
	  if (error) {
	    res.send(error);
	  }else {
	    res.json(oneArticle);
	  }
	});

})

app.put("/save/:id", function(req,res){

	db.saved.insert({
		article_id : req.params.id
	},
    function(err, inserted) {
      if (err) {
        	// Log the error if one is encountered during the query
       		res.json({error:err})
      }
      else {
          	// Send a "Scrape Complete" message to the browser
				
      }
    });

    res.send("1")

})

app.get("/fetchSavedArticles",function(req,res) {

	//find saved articles
	db.saved.find({},function(error, news1){
		if(error) {
		  console.log(error)
		} else {
			//var o = {news:news}
			//res.render("pages/save",o)
			var newsId = []
			var o
			for (var t = 0; t < news1.length; t++) {
				newsId.push(mongo.ObjectId(news1[t].article_id))
			}
			db.scrapedData.find({
				"_id": {$in:newsId}
			}, function(error, oneArticle) {
			  
			   		if (error) {
			        	console.log(error);
			      	} else {
			        	o = {news:oneArticle}
			        	//console.log(o)
						res.render("pages/save",o)
			      	  }

			});	
			
	  	  }
	});

})

app.delete("/delete/:id", function(req,res){

	db.saved.remove({
		article_id : req.params.id
    },true,function(err, result) {
    	if (result.deletedCount == 1) {
    		res.send("1")
    		db.comments.remove({
    			"article_id": req.params.id
    		},false)
    	} else {
    		res.send(err)
    	  }
    });

})

app.get("/fetchComments/:id",function(req,res) {

	//find comments by article id
	db.comments.find({
	  article_id: req.params.id
	}, function(error, oneArticle) {
	  if (error) {
	    res.send(error);
	  }else {
	    res.json(oneArticle);
	  }
	});


})

app.post("/addComments", function(req,res) {

	db.comments.insert({
          article_id : req.body.article_id,
          comments : req.body.comments 
    },
    function(err, inserted) {
      if (err) {
        	// Log the error if one is encountered during the query
       		res.json({error:err})
      }
      else {
          	// Send a "Scrape Complete" message to the browser
			res.json({message:"1"})
      }
    });

})

app.delete("/deleteComments/:id", function(req,res){

	db.comments.remove({
		"_id" : mongo.ObjectId(req.params.id)
    },true,function(err, result) {
    	if (result.deletedCount == 1) {
    		res.send("1")
    	} else {
    		res.send(err)
    	  }
    });

})

//Listening to port
app.listen(port, function() {
  console.log("App running on port "+port+"!");
});
