(function(window){

    var Blocker = {
        isCurrencyPage: false,
        usersBlocked: [],
        init: function() {
            this.checkPage()
            this.hideBlockedUsers();
            this.allWhispers();
        },
        checkPage: function() {
            var host = window.location.host;
            this.isCurrencyPage = host.indexOf('currency') > -1
        },
        hideBlockedUsers: function() {
            var self = this;

            chrome.storage.sync.get(['blocked-sellers'], function (blockedSellers) {
                var results = blockedSellers['blocked-sellers'] ? blockedSellers['blocked-sellers'] : []; 
                self.usersBlocked = results;

                _.each(self.usersBlocked, function(seller){
                    self.hideUser(seller);
                });
            });
        },
        allWhispers: function() {
            var self = this;
            var sellers = this.isCurrencyPage ? $('#content .displayoffer .row:nth-child(2) .displayoffer-bottom .right') : $('.search-results tbody .bottom-row td:nth-child(2) .requirements ul');

            _.each(sellers, function(seller){
                self.appendBlockButton(seller);
            });
        },
        appendBlockButton: function(el) {
            var btn = '<a class="block-seller" href="#">Block</a>'

            if (this.isCurrencyPage) {
                btn = `<span class="block-seller-wrapper">${btn}</span>`
            } else {
                btn = `<li>${btn}</li>`
            }

            $(el).append(btn);
        },
        blockUser: function(user) {
            this.usersBlocked.push(user);

            var jsonObj = {};
            jsonObj['blocked-sellers'] = this.usersBlocked;

            chrome.storage.sync.set(jsonObj);
            this.hideUser(user);
        },
        hideUser: function(user) {
            if(this.isCurrencyPage) {
                $('.displayoffer[data-username="'+user+'"]').hide()
            } else {
                $('.search-results tbody[data-seller="'+user+'"]').hide()
            }
        }
    }

    $(document).on('click', '.block-seller', function(e){
        e.preventDefault();
        var seller = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('username') : $(this).parents('tbody').data('seller');

        if(seller) {
            if(confirm('Block this seller?')) {
                Blocker.blockUser(seller);
            }            
        }
    });

    $(document).ready(function(){
        Blocker.init()
    });

})(window)