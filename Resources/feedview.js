var AbstractState, FeedView, InitEndState, InitStartState, NormalState, PagingEndState, PagingStartState, PullingState, ReloadEndState, ReloadStartState,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Ti.include('feed.js');

Ti.include('util.js');

AbstractState = (function() {

  AbstractState.prototype.toString = function() {
    return 'AbstractState';
  };

  function AbstractState(feedView) {
    this.feedView = feedView;
  }

  AbstractState.prototype.getFeed = function(url) {
    var onerror, onload, self, xhr;
    self = this;
    onload = this.onload;
    onerror = this.onerror;
    xhr = Ti.Network.createHTTPClient();
    xhr.timeout = 30000;
    xhr.open('GET', url);
    xhr.onload = function() {
      var data;
      data = JSON.parse(this.responseText);
      onload.apply(self, [data]);
      xhr.onload = null;
      xhr.onerror = null;
      return xhr = null;
    };
    xhr.onerror = function(err) {
      return onerror.apply(self, [err]);
    };
    return xhr.send();
  };

  AbstractState.prototype.onload = function(data) {};

  AbstractState.prototype.scroll = function(e) {};

  AbstractState.prototype.scrollEnd = function(e) {};

  AbstractState.prototype.execute = function() {};

  AbstractState.prototype.onerror = function(err) {
    return alert(err.error);
  };

  return AbstractState;

})();

NormalState = (function(_super) {

  __extends(NormalState, _super);

  NormalState.prototype.toString = function() {
    return 'NormalState';
  };

  function NormalState(feedView) {
    this.feedView = feedView;
    this.lastDistance = 0;
  }

  NormalState.prototype.scroll = function(e) {
    var distance, height, nearEnd, offset, t, theEnd, total;
    offset = e.contentOffset.y;
    if (offset <= -65.0) {
      t = Ti.UI.create2DMatrix();
      t = t.rotate(-180);
      this.feedView.header.arrow.animate({
        transform: t,
        duration: 180
      });
      this.feedView.header.statusLabel.text = "指をはなして更新…";
      return this.feedView.transitState(new PullingState(this.feedView));
    } else {
      offset = e.contentOffset.y;
      height = e.size.height;
      total = offset + height;
      theEnd = e.contentSize.height;
      distance = theEnd - total;
      if (distance < this.lastDistance) {
        nearEnd = theEnd * .98;
        if (total >= nearEnd && this.feedView.lastRow > 5) {
          this.feedView.transitState(new PagingStartState(this.feedView));
        }
      }
      return this.lastDistance = distance;
    }
  };

  return NormalState;

})(AbstractState);

PullingState = (function(_super) {

  __extends(PullingState, _super);

  function PullingState() {
    PullingState.__super__.constructor.apply(this, arguments);
  }

  PullingState.prototype.toString = function() {
    return "PullingState";
  };

  PullingState.prototype.scroll = function(e) {
    var offset, t;
    offset = e.contentOffset.y;
    if (offset > -65.0 && offset < 0) {
      t = Ti.UI.create2DMatrix();
      this.feedView.header.arrow.animate({
        transform: t,
        duration: 180
      });
      this.feedView.header.statusLabel.text = "画面を引き下げて…";
      return this.feedView.transitState(new NormalState(this.feedView));
    }
  };

  PullingState.prototype.scrollEnd = function(e) {
    if (e.contentOffset.y <= -65.0) {
      this.feedView.header.arrow.hide();
      this.feedView.header.indicator.show();
      this.feedView.header.statusLabel.text = "読み込み中…";
      this.feedView.table.setContentInsets({
        top: 60
      }, {
        animated: true
      });
      this.feedView.header.arrow.transform = Ti.UI.create2DMatrix();
      return this.feedView.transitState(new ReloadStartState(this.feedView));
    }
  };

  return PullingState;

})(AbstractState);

ReloadStartState = (function(_super) {

  __extends(ReloadStartState, _super);

  function ReloadStartState() {
    ReloadStartState.__super__.constructor.apply(this, arguments);
  }

  ReloadStartState.prototype.toString = function() {
    return "ReloadStartState";
  };

  ReloadStartState.prototype.execute = function() {
    return this.getFeed(this.feedView.url);
  };

  ReloadStartState.prototype.onload = function(data) {
    return this.feedView.transitState(new ReloadEndState(this.feedView, data));
  };

  ReloadStartState.prototype.onerror = function(err) {
    this.feedView.showFailure();
    this.feedView.table.setContentInsets({
      top: 0
    }, {
      animated: true
    });
    this.feedView.header.lastUpdatedLabel.text = "最後の更新: " + $$$.formatDate();
    this.feedView.header.statusLabel.text = "画面を引き下げて…";
    this.feedView.header.indicator.hide();
    this.feedView.header.arrow.show();
    return this.feedView.transitState(new NormalState(this.feedView));
  };

  return ReloadStartState;

})(AbstractState);

ReloadEndState = (function(_super) {

  __extends(ReloadEndState, _super);

  ReloadEndState.prototype.toString = function() {
    return "ReloadEndState";
  };

  function ReloadEndState(feedView, data) {
    this.feedView = feedView;
    this.data = data;
  }

  ReloadEndState.prototype.execute = function() {
    var feed;
    feed = new Feed(this.data);
    this.feedView.setFeed(feed);
    this.feedView.table.setContentInsets({
      top: 0
    }, {
      animated: true
    });
    this.feedView.header.lastUpdatedLabel.text = "最後の更新: " + $$$.formatDate();
    this.feedView.header.statusLabel.text = "画面を引き下げて…";
    this.feedView.header.indicator.hide();
    this.feedView.header.arrow.show();
    return this.feedView.transitState(new NormalState(this.feedView));
  };

  return ReloadEndState;

})(AbstractState);

PagingStartState = (function(_super) {

  __extends(PagingStartState, _super);

  function PagingStartState() {
    PagingStartState.__super__.constructor.apply(this, arguments);
  }

  PagingStartState.prototype.toString = function() {
    return "PagingStartState";
  };

  PagingStartState.prototype.execute = function() {
    this.feedView.pager.show();
    return this.getFeed(this.feedView.url + ("?of=" + this.feedView.lastRow));
  };

  PagingStartState.prototype.onload = function(data) {
    return this.feedView.transitState(new PagingEndState(this.feedView, data));
  };

  PagingStartState.prototype.onerror = function(err) {
    var i;
    this.feedView.showFailure();
    i = this.feedView.lastRow;
    this.feedView.pager.hide(i);
    return this.feedView.transitState(new NormalState(this.feedView));
  };

  return PagingStartState;

})(AbstractState);

PagingEndState = (function(_super) {

  __extends(PagingEndState, _super);

  PagingEndState.prototype.toString = function() {
    return "PagingEndState";
  };

  function PagingEndState(feedView, data) {
    this.feedView = feedView;
    this.data = data;
  }

  PagingEndState.prototype.execute = function() {
    var feed, i;
    i = this.feedView.lastRow;
    feed = new Feed(this.data);
    this.feedView.appendFeed(feed);
    this.feedView.pager.hide(i);
    return this.feedView.transitState(new NormalState(this.feedView));
  };

  return PagingEndState;

})(AbstractState);

InitStartState = (function(_super) {

  __extends(InitStartState, _super);

  InitStartState.prototype.toString = function() {
    return "InitStartState";
  };

  function InitStartState(feedView) {
    this.feedView = feedView;
  }

  InitStartState.prototype.execute = function() {
    var loadingInd, loadingRow;
    loadingRow = Ti.UI.createTableViewRow({
      height: 44
    });
    loadingInd = Ti.UI.createActivityIndicator({
      backgroundColor: "#fff",
      top: 10,
      bottom: 10,
      style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
    });
    loadingInd.show();
    loadingRow.add(loadingInd);
    this.feedView.table.setData([loadingRow]);
    return this.getFeed(this.feedView.url);
  };

  InitStartState.prototype.onload = function(data) {
    return this.feedView.transitState(new InitEndState(this.feedView, data));
  };

  InitStartState.prototype.onerror = function(err) {
    this.feedView.showFailure();
    this.feedView.clear();
    return this.feedView.transitState(new NormalState(this.feedView));
  };

  return InitStartState;

})(AbstractState);

InitEndState = (function(_super) {

  __extends(InitEndState, _super);

  InitEndState.prototype.toString = function() {
    return "InitEndState";
  };

  function InitEndState(feedView, data) {
    this.feedView = feedView;
    this.data = data;
  }

  InitEndState.prototype.execute = function() {
    var feed;
    feed = new Feed(this.data);
    this.feedView.setFeed(feed);
    return this.feedView.transitState(new NormalState(this.feedView));
  };

  return InitEndState;

})(AbstractState);

FeedView = (function() {

  FeedView.prototype.state = null;

  FeedView.prototype.transitState = function(nextState) {
    Ti.API.debug(" -> " + nextState.toString());
    this.state = nextState;
    return this.state.execute();
  };

  FeedView.prototype.initialize = function() {
    return this.transitState(new InitStartState(this));
  };

  function FeedView(_arg) {
    var actInd, arrow, border, header, lastUpdatedLabel, statusLabel, table,
      _this = this;
    this.win = _arg.win, this.url = _arg.url;
    table = Ti.UI.createTableView({
      data: []
    });
    table.addEventListener('click', function(e) {
      var row;
      row = e.rowData;
      if (row.bookmark) {
        return Ti.UI.currentTab.open(Ti.UI.createWindow({
          url: 'permalink.js',
          title: 'ブックマーク',
          bookmark: row.bookmark
        }));
      }
    });
    table.addEventListener('scroll', function(e) {
      return _this.state.scroll(e);
    });
    table.addEventListener('scrollEnd', function(e) {
      return _this.state.scrollEnd(e);
    });
    this.win.add(table);
    border = Ti.UI.createView({
      backgroundColor: "#576c89",
      height: 2,
      bottom: 0
    });
    header = Ti.UI.createView({
      backgroundColor: "#e2e7ed",
      width: 320,
      height: 60
    });
    header.add(border);
    arrow = Ti.UI.createView({
      backgroundColor: "#e2e7ed",
      backgroundImage: "./images/whiteArrow.png",
      width: 23,
      height: 60,
      bottom: 10,
      left: 20
    });
    statusLabel = Ti.UI.createLabel({
      backgroundColor: "#e2e7ed",
      text: "画面を引き下げて…",
      left: 55,
      width: 200,
      bottom: 30,
      height: Ti.UI.SIZE,
      color: "#576c89",
      textAlign: "center",
      font: {
        fontSize: 14,
        fontWeight: "bold"
      },
      shadowColor: "#fff",
      shadowOffset: {
        x: 0,
        y: 1
      }
    });
    lastUpdatedLabel = Ti.UI.createLabel({
      backgroundColor: "#e2e7ed",
      text: "最後の更新: " + $$$.formatDate(),
      left: 55,
      width: 200,
      bottom: 15,
      height: Ti.UI.SIZE,
      color: "#576c89",
      textAlign: "center",
      font: {
        fontSize: 12
      },
      shadowColor: "#fff",
      shadowOffset: {
        x: 0,
        y: 1
      }
    });
    actInd = Titanium.UI.createActivityIndicator({
      backgroundColor: "#e2e7ed",
      style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
      left: 20,
      bottom: 13,
      width: 30,
      height: 30
    });
    header.add(arrow);
    header.add(statusLabel);
    header.add(lastUpdatedLabel);
    header.add(actInd);
    table.headerPullView = header;
    this.lastRow = 0;
    this.table = table;
    this.header = {};
    this.header.arrow = arrow;
    this.header.statusLabel = statusLabel;
    this.header.lastUpdatedLabel = lastUpdatedLabel;
    this.header.indicator = actInd;
    this.pager = {};
    this.pager.createRow = function() {
      var ind, row;
      row = Ti.UI.createTableViewRow({
        height: 44
      });
      ind = Ti.UI.createActivityIndicator({
        top: 10,
        bottom: 10,
        style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
      });
      row.add(ind);
      ind.show();
      return row;
    };
    this.pager.show = function() {
      return _this.table.appendRow(_this.pager.createRow());
    };
    this.pager.hide = function(index) {
      return _this.table.deleteRow(index, {
        animationStyle: Titanium.UI.iPhone.RowAnimationStyle.NONE
      });
    };
  }

  FeedView.prototype.setFeed = function(feed) {
    this.table.setData(feed.toRows());
    return this.lastRow = feed.size();
  };

  FeedView.prototype.clear = function() {
    this.table.setData([]);
    return this.lastRow = 0;
  };

  FeedView.prototype.showFailure = function() {
    var dialog;
    dialog = Ti.UI.createAlertDialog({
      title: "エラー",
      message: "フィードを取得できません"
    });
    return dialog.show();
  };

  FeedView.prototype.appendFeed = function(feed) {
    var rows;
    rows = feed.toRows();
    this.table.appendRow(rows);
    return this.lastRow += feed.size();
  };

  return FeedView;

})();
