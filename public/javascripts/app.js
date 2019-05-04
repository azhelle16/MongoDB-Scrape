/*
 #######################################################################
 #
 #  FUNCTION NAME : 
 #  AUTHOR        : 
 #  DATE          : 
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : 
 #  PARAMETERS    : 
 #
 #######################################################################
*/

//GLOBAL VARIABLES
var did // to be used for deleting a saved article
var fromDel = false
var aid // to be used in saving comments for the article

$(document).on("click","button",function() {

	switch($(this).text().toLowerCase()) {
		case "save article":
			var id = $(this).attr("id")
			var isSaved = checkArticle(id)

			if (isSaved) {
				alertMsg("Article was already in the database!","prompt")
			} else {
				saveArticle(id)
			  }
		break;
		case "delete from saved":
			var art = $(this)[0].parentElement.parentElement.previousElementSibling.title
			did = $(this).attr("id").split("-")[1]
			alertMsg("Are you sure you want to delete the article - <b>"+art+"</b> from <b>Saved Articles</b>?","confirm")
		break;
		case "yes":
			deleteSavedArticle(did)
		break;
		case "no":
			did = ""
		break;
		case "ok":
			if (fromDel == true) {
				fromDel = false
				window.location.href = "/fetchSavedArticles"
			} 
		break;
		case "article notes":
			var id = $(this).attr("id").split("-")[1]
			var art = $(this)[0].parentElement.parentElement.previousElementSibling.title
			showArticles(id,art)
		break;
		case "close":
			aid = ""
		break;
		case "save":
			$("#textcount").text("255")
			saveComments()
		break;
	}

})

$(document).on('keyup',function(event){

	if ($("#articleModal").is(":visible")) {
		//console.log(event.keyCode)
		var cnt = parseInt($("#textcount").text())
		if (((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122) || event.keyCode == 32) && cnt >= 0) {
			cnt--
		} else if (event.keyCode == 8 && cnt <= 255) {
			cnt++
			if (cnt > 255)
				cnt--
		  }
		$("#textcount").text(cnt)
	}

})

$(document).on('paste',function(event){

	if ($("#articleModal").is(":visible")) {
		event.preventDefault()
	}

});

/*
 #######################################################################
 #
 #  FUNCTION NAME : alertMsg
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : May 01, 2019 PDT
 #  MODIFIED BY   : Maricel Louise Sumulong
 #  REVISION DATE : May 02, 2019 PDT
 #  REVISION #    : 1
 #  DESCRIPTION   : alerts error message
 #  PARAMETERS    : message, prompt type
 #
 #######################################################################
*/

function alertMsg(msg,conf) {

  $("#alertModal .modal-body").empty().append(msg)
  $("#alertModal").modal("show")

  switch (conf) {
  	case "confirm":
  		$("#modalAlertBtn").hide();
  		$("#yesAlertBtn, #noAlertBtn").show();
  	break; 
  	default:
  		$("#modalAlertBtn").show();
  		$("#yesAlertBtn, #noAlertBtn").hide();
  	break;
  }

}

/*
 #######################################################################
 #
 #  FUNCTION NAME : saveArticle
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : May 02, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : save selected articles in the database
 #  PARAMETERS    : article id
 #
 #######################################################################
*/

function saveArticle(id) {

	$.ajax({
	    url: '/save/' + id,
	    method: 'PUT',
	    async: false,
	}).done(function(r){

			if (r == "1") {
				alertMsg("Article Saved!","prompt")
			} else {
				alertMsg("Error In Code!","prompt")	
			  }


	   });
}

/*
 #######################################################################
 #
 #  FUNCTION NAME : checkArticle
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : May 01, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : checks if selected article is already in the database
 #  PARAMETERS    : article id
 #
 #######################################################################
*/

function checkArticle(id) {

	var ret 

	$.ajax({
	    url: '/check/' + id,
	    method: 'GET',
	    async: false,
	}).done(function(r){

			ret = r
	   
	   });

	return ret
}

/*
 #######################################################################
 #
 #  FUNCTION NAME : deleteSavedArticle
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : May 02, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : delete saved article
 #  PARAMETERS    : article id
 #
 #######################################################################
*/

function deleteSavedArticle(id) {

	$.ajax({
	    url: '/delete/' + id,
	    method: 'DELETE',
	    async: false,
	}).done(function(r){

			did = ""

			if (r == "1") {
				fromDel = true
				alertMsg("Article Deleted!","prompt")
			} else {
				alertMsg("Error In Code!","prompt")	
			  }


	   });
}

/*
 #######################################################################
 #
 #  FUNCTION NAME : showArticles
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : May 02, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : show comments for articles
 #  PARAMETERS    : article id, article name
 #
 #######################################################################
*/

function showArticles(id, art) {

	aid = id
	$.ajax({
	    url: '/fetchComments/' + aid,
	    method: 'GET',
	    async: false,
	}).done(function(r){

			if ($("#articleModal").is(":visible")) {
				var ar = $("#article-"+id)[0].parentElement.parentElement.previousElementSibling.title
				$("#artTitle").empty().append("ARTICLE: <b>"+ar+"</b>")

				$("#commentsDiv").empty()
				if (r.length == 0) {
					$("#commentsDiv").empty().append("<p>No comments for the article yet</p>")
				} else {
					for (var t = 0; t < r.length; t++) {
						var x = $("<p>").text(r[t].comments)
						var i = $("<i>").attr("class","fas fa-trash-alt")
						i.attr("id",r[t]._id)
						i.attr("onclick","deleteComment('"+r[t]._id+"')")
						x.append("&nbsp;")
						x.append(i)
						$("#commentsDiv").append(x)
						
					}
				  }

			} else {
				if (r == null) {
					$("#commentsDiv").empty().append("<p>No comments for the article yet</p>")
				} else if (r.length == 0) {
					$("#commentsDiv").empty().append("<p>No comments for the article yet</p>")
				} else {
					$("#commentsDiv").empty()
					console.log(r)
					for (var t = 0; t < r.length; t++) {
						var x = $("<p>").text(r[t].comments)
						var i = $("<i>").attr("class","fas fa-trash-alt")
						i.attr("id",r[t]._id)
						i.attr("onclick","deleteComment('"+r[t]._id+"')")
						x.append("&nbsp;")
						x.append(i)
						$("#commentsDiv").append(x)
						
					}
				  }
				$("#artTitle").empty().append("ARTICLE: <b>"+art+"</b>")
				$("#articleModal").modal("show")
			  }


	   });
 
}

/*
 #######################################################################
 #
 #  FUNCTION NAME : saveComments
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : May 02, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : save comments for the articles
 #  PARAMETERS    : none
 #
 #######################################################################
*/

function saveComments() {

	var com = $("textarea").val()
	$.ajax({
	    url: '/addComments',
	    method: 'POST',
	    data: {article_id:aid, comments: com},
	    async: false,
	}).done(function(r){

			$("textarea").val("")
			showArticles(aid,"")


	   });
 
}

/*
 #######################################################################
 #
 #  FUNCTION NAME : deleteComments
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : May 02, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : delete saved comments in the database
 #  PARAMETERS    : article id
 #
 #######################################################################
*/

function deleteComment(id) {

	$.ajax({
	    url: '/deleteComments/' + id,
	    method: 'DELETE',
	    async: false,
	}).done(function(r){

			if (r == "1")
				showArticles(aid,"")

	   });
}
