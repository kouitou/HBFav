_ = require '/lib/underscore'
Ti.include 'ui.js'
Ti.include 'Instapaper.js'

view = Ti.UI.createView
  layout: 'vertical'

nameLabel = Ti.UI.createLabel _($$.form.label).extend
  top: 12
  left: 15
  text: "ユーザー名"

nameField = Ti.UI.createTextField _($$.form.textInput).extend
  hintText: 'foo@example.com'
  value: Ti.App.Properties.getString 'instapaper_username'
  keyboardType: Ti.UI.KEYBOARD_EMAIL
  autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE

passwordLabel = Ti.UI.createLabel _($$.form.label).extend
  top: 12
  left: 15
  text: "パスワード"

passwordField = Ti.UI.createTextField _($$.form.textInput).extend
  hintText: 'パスワード'
  value: Ti.App.Properties.getString 'instapaper_password'
  passwordMask: true
  autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE

view.add nameLabel
view.add nameField
view.add passwordLabel
view.add passwordField

win = Ti.UI.currentWindow

HBFav.UI.setupConfigWindow win, (e) ->
  Instapaper.user =
    username: nameField.value
    password: passwordField.value

  Instapaper.authenticate ->
    if @.status is 200
      Ti.App.Properties.setString 'instapaper_username', nameField.value
      Ti.App.Properties.setString 'instapaper_password', passwordField.value
      win.close()
    else
      dialog = Ti.UI.createAlertDialog
        title: "Authenticate Failed"
        message: "StatusCode: #{@.status}"
      dialog.show()

win.add view