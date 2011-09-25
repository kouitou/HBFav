require 'lib/underscore'

win = Ti.UI.currentWindow

data = []
tableView = Ti.UI.createTableView
  data: data

win.add tableView

## Pull to Refresh

# function formatDate()
# {
#   var date = new Date();
#   var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
#   if (date.getHours()>=12)
#   {
#     datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
#   }
#   else
#   {
#     datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
#   }
#   return datestr;
# }

# var data = [
#   {title:"Row 1"},
#   {title:"Row 2"},
#   {title:"Row 3"}
# ];
#
# var lastRow = 4;

border = Ti.UI.createView
  backgroundColor:"#576c89"
  height:2
  bottom:0

tableHeader = Ti.UI.createView
  backgroundColor:"#e2e7ed"
  width:320
  height:60

tableHeader.add border

arrow = Ti.UI.createView
  backgroundImage:"./images/whiteArrow.png"
  width:23
  height:60
  bottom:10
  left:20

statusLabel = Ti.UI.createLabel
  text: "画面を引き下げて…"
  left:55
  width:200
  bottom:30
  height:"auto"
  color:"#576c89"
  textAlign:"center"
  font:
    fontSize:12
    fontWeight:"bold"
  shadowColor:"#999"
  shadowOffset:
    x:0
    y:1

lastUpdatedLabel = Ti.UI.createLabel
  # text:"Last Updated: "+formatDate(),
  text: "最後の更新: "
  left:55
  width:200
  bottom:15
  height:"auto"
  color:"#576c89"
  textAlign:"center"
  font:
    fontSize:11
  shadowColor:"#999",
  shadowOffset:
    x:0
    y:1

actInd = Titanium.UI.createActivityIndicator
  left:20
  bottom:13
  width:30
  height:30

tableHeader.add arrow
tableHeader.add statusLabel
tableHeader.add lastUpdatedLabel
tableHeader.add actInd

tableView.headerPullView = tableHeader

pulling   = false
reloading = false

beginReloading = ->
  # just mock out the reload
  setTimeout endReloading, 2000

endReloading = ->
  # simulate loading
  # for (var c=lastRow;c<lastRow+10;c++)
  # {
  #   tableView.appendRow({title:"Row "+c});
  # }
  # lastRow += 10;

  ## when you're done, just reset
  tableView.setContentInsets({top:0},{animated:true})
  reloading = false
  ## lastUpdatedLabel.text = "Last Updated: "+formatDate();
  lastUpdatedLabel.text = "最後の更新: "
  statusLabel.text = "画面を引き下げて…";
  actInd.hide()
  arrow.show()

tableView.addEventListener 'scroll', (e) ->
  offset = e.contentOffset.y;
  if offset <= -65.0 and not pulling
    t = Ti.UI.create2DMatrix()
    t = t.rotate -180
    pulling = true
    arrow.animate transform:t, duration:180
    statusLabel.text = "指をはなして更新…"
  else if pulling and offset > -65.0 and offset < 0
    pulling = false;
    t = Ti.UI.create2DMatrix()
    arrow.animate transform:t,duration:180
    statusLabel.text = "画面を引き下げて…"

tableView.addEventListener 'scrollEnd', (e) ->
  if pulling and not reloading and e.contentOffset.y <= -65.0
    reloading = true
    pulling = false
    arrow.hide()
    actInd.show()
    statusLabel.text = "読み込み中…"
    tableView.setContentInsets({top:60},{animated:true})
    arrow.transform=Ti.UI.create2DMatrix();
    beginReloading();

## Reloading
user = 'naoya'
url = "http://localhost:3000/#{user}"

xhr = Ti.Network.createHTTPClient()
xhr.open 'GET', url
xhr.onload = ->
  feed = JSON.parse @.responseText

  tableView.setData _(feed.bookmarks).map (bookmark) ->
    row = Ti.UI.createTableViewRow
      height: 'auto'
      layout: 'absolute'

    imageContainer = Ti.UI.createView
      layout: 'vertical'
      width: 320
      height: '68'
      top: 0
      left: 0

    image = Ti.UI.createImageView
      image: bookmark.user.profile_image_url
      width: 48
      height: 48
      top: 10
      left: 10

    name = Ti.UI.createLabel
      width: 'auto'
      height: 'auto'
      left: 65
      top: 10
      color: "#000"
      font:
        "font-size" : 12
        fontWeight: 'bold'

    bodyContainer = Ti.UI.createView
      layout: 'vertical'
      width: 245
      height: 'auto'
      top: 33
      left: 65
      bottom: 10

    comment = Ti.UI.createLabel
      color: '#000'
      top: 0
      left: 0
      width: 'auto'
      height: 'auto'
      bottom: 6
      font:
        "font-size": 14

    titleContainer = Ti.UI.createView
      layout: 'horizontal'
      width: 245
      height: 'auto'
      top: 0
      left: 0
      # bottom: 10

    favicon = Ti.UI.createImageView
      image: bookmark.favicon_url
      width: 14
      height: 14
      top: 2
      left: 0

    title = Ti.UI.createLabel
      color: '#3B5998'
      top: 0
      left: 3
      width: 'auto'
      height: 'auto'
      font:
        "font-size": 14

    date = Ti.UI.createLabel
      width: 'auto'
      height: 'auto'
      top: 10
      right: 10
      color: '#999'
      font:
        fontSize: 12

    imageContainer.add image

    if bookmark.comment?.length > 0
      bodyContainer.add comment
    titleContainer.add favicon
    titleContainer.add title
    bodyContainer.add titleContainer

    name.text    = bookmark.user.name
    comment.text = bookmark.comment ? ""
    title.text   = bookmark.title
    date.text    = bookmark.created_at

    row.add imageContainer
    row.add name
    row.add bodyContainer
    row.add date
    row

  tableView.addEventListener 'click', (e) ->
    bookmark = feed.bookmarks[e.index]
    permalink = Ti.UI.createWindow
      url: 'permalink.js'
      title: bookmark.user.name
      backgroundColor: '#fff'
      bookmark: bookmark
    Ti.UI.currentTab.open permalink

xhr.send()