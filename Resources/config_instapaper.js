var cancelButton, doneButton, nameField, nameLabel, passwordField, passwordLabel, view, win;
win = Ti.UI.currentWindow;
win.backgroundColor = 'stripped';
view = Ti.UI.createView({
  layout: 'vertical'
});
nameLabel = Ti.UI.createLabel({
  width: 'auto',
  height: 'auto',
  top: 12,
  left: 15,
  text: "ユーザー名",
  color: "#333",
  shadowColor: "#fff",
  shadowOffset: {
    x: 0,
    y: 1
  },
  font: {
    fontSize: 14,
    fontWeight: "bold"
  }
});
nameField = Ti.UI.createTextField({
  value: Ti.App.Properties.getString('instapaper_username'),
  top: 6,
  left: 10,
  width: 300,
  height: 40,
  color: '#194C7F',
  hintText: 'foo@example.com',
  keyboardType: Ti.UI.KEYBOARD_EMAIL,
  autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
  backgroundColor: '#fff',
  font: {
    fontSize: 16
  },
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: 10
});
passwordLabel = Ti.UI.createLabel({
  width: 'auto',
  height: 'auto',
  top: 12,
  left: 15,
  text: "パスワード",
  color: "#333",
  shadowColor: "#fff",
  shadowOffset: {
    x: 0,
    y: 1
  },
  font: {
    fontSize: 14,
    fontWeight: "bold"
  }
});
passwordField = Ti.UI.createTextField({
  value: Ti.App.Properties.getString('instapaper_password'),
  top: 6,
  left: 10,
  width: 300,
  height: 40,
  color: '#194C7F',
  passwordMask: true,
  hintText: 'パスワード',
  autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
  backgroundColor: '#fff',
  font: {
    fontSize: 16
  },
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: 10
});
view.add(nameLabel);
view.add(nameField);
view.add(passwordLabel);
view.add(passwordField);
win.add(view);
doneButton = Ti.UI.createButton({
  style: Ti.UI.iPhone.SystemButtonStyle.DONE,
  visible: true,
  title: '保存'
});
doneButton.addEventListener('click', function(e) {
  Ti.App.Properties.setString('instapaper_username', nameField.value);
  Ti.App.Properties.setString('instapaper_password', passwordField.value);
  return win.close();
});
win.setRightNavButton(doneButton);
cancelButton = Ti.UI.createButton({
  visible: true,
  title: "キャンセル"
});
cancelButton.addEventListener('click', function(e) {
  return win.close();
});
win.setLeftNavButton(cancelButton);