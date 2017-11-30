(function() {
	if ('serviceWorker' in navigator && 'PushManager' in window) {
	    window.addEventListener('load', function () {
	    	// 注册service worker
	    	function registerServiceWorker() {
			    return navigator.serviceWorker.register('/sw.js', {scope: '/'})
			    .then(registration => {
			        console.log('ServiceWorker registration successful with scope: ', registration.scope);
			        return registration;
			    })
			    .catch(err => {
			        console.log('ServiceWorker registration failed: ', err);
			    });
			}

			// 通知
	        let promiseChain = new Promise((resolve, reject) => {
		        const permissionPromise = Notification.requestPermission(result => {
		            resolve(result);
		        });

		        if (permissionPromise) {
		            permissionPromise.then(resolve);
		        }
		    })
		    .then(result => {
		        if (result === 'granted') {
		            execute();
		        }
		        else {
		            console.log('no permission');
		        }
		    });


		    function execute() {
			    registerServiceWorker().then(registration => {
			    	setTimeout(function() {
			    		registration.showNotification('----Hello World!----');
			    	},2000)
			        
			    });
			}

			// 推送
			navigator.serviceWorker.ready.then(function(reg) { subscribe(reg) });

			// 将base64的applicationServerKey转换成UInt8Array
			function urlBase64ToUint8Array(base64String) {
			    var padding = '='.repeat((4 - base64String.length % 4) % 4);
			    var base64 = (base64String + padding)
			        .replace(/\-/g, '+')
			        .replace(/_/g, '/');
			    var rawData = window.atob(base64);
			    var outputArray = new Uint8Array(rawData.length);
			    for (var i = 0, max = rawData.length; i < max; ++i) {
			        outputArray[i] = rawData.charCodeAt(i);
			    }
			    return outputArray;
			}

			function subscribe(serviceWorkerReg) {
			    serviceWorkerReg.pushManager.subscribe({ // 2. 订阅
			            userVisibleOnly: true
			            // ,applicationServerKey: urlBase64ToUint8Array('<applicationServerKey>')
			        })
			        .then(function(subscription) {
			            // 3. 发送推送订阅对象到服务器，具体实现中发送请求到后端api
			            sendEndpointInSubscription(subscription);
			        })
			        .catch(function() {
			            if (Notification.permission === 'denied') {
			                // 用户拒绝了订阅请求
			            }
			        });
			}


	    });
	}
})()