angular.module('bligoapp.controllers', [])

.controller('LoginCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage, $ionicHistory) {
  
  $scope.loginData = {usuario: '', clave: ''};
  $localStorage.BligoApp = {auth: 0, id: '', nombre: '', correo: '', clave: '', foto: ''};
  $scope.doLogin = function() {
    $rootScope.showload();
    var data = {'action':'login', 'usuario': $scope.loginData.usuario, 'clave': $scope.loginData.clave };
    $http.post(rest, data).
    then(function (data, status, headers, config) {
      $rootScope.hideload();
      if (data.data.res == 'OK') { 
        $localStorage.BligoApp.auth = 1;
        $localStorage.BligoApp.id = data.data.id;
        $localStorage.BligoApp.nombre = data.data.nombre;
        $localStorage.BligoApp.correo = data.data.correo;
        $localStorage.BligoApp.clave = data.data.clave;
        $localStorage.BligoApp.foto = '';

        $state.go( "main.home" );
      }
      else {
        $rootScope.err('Acceso denegado. Intente nuevamente');
        $rootScope.hideload();
      }
    },
    function (data, status, headers, config) { 
      $rootScope.showload();
      $rootScope.err();
    });
  };



})

.controller('MainCtrl', function($scope, $webSql, $ionicNavBarDelegate, $stateParams, $timeout, $window, $location, $ionicHistory, $ionicSideMenuDelegate, $ionicLoading, $localStorage, $state, $http, $rootScope, $ionicModal, $cordovaGeolocation, $interval) {

  if (!$localStorage.BligoApp) {
    $state.go("login");
  }

  $scope.bligoapp = $localStorage.BligoApp;

})


.controller('HomeCtrl', function($scope, $http, $rootScope, $ionicModal, $stateParams, $timeout, $location, $state, $localStorage, $ionicHistory) {

  $scope.closeQR = function() {
    $scope.modalOK.hide();
    $scope.modalOK.remove();
  };
  $scope.leer_qr = function() {

   $scope.modalData = { staffID: 0, staffName: '', evento: '' };

   cordova.plugins.barcodeScanner.scan(
      function (result) {
        if (result.cancelled == 1) {
          // Cancelado por el usuario
        }
        else {
          if (result.format == "QR_CODE") { 


            $rootScope.showload('validando QR...');
            var data = {'action':'validar_qr', 'qr': result.text };
            $http.post(rest, data).
            then(function (data, status, headers, config) {
              $rootScope.hideload();
              if (data.data.res == 'OK') { 

                $scope.modalData = { staffID: data.data.staffID, staffName: data.data.staffName, evento: data.data.evento };

                $ionicModal.fromTemplateUrl('templates/QR.html', {
                  scope: $scope,
                  animation: 'slide-in-right'
                }).then(function(modal) {
                  $scope.modalOK = modal;
                  $scope.modalOK.show();
                });
              }
              else {
                $rootScope.err(data.data.msg);
              }
            },
            function (data, status, headers, config) { 
              $rootScope.showload();
              $rootScope.err();
            });

          }
          else {
            $rootScope.err('El código escaneado no corresponde a un QR');
          }
        }
      },
      function (error) {
          //$rootScope.err("Error, es posible que su camara este en uso por otra aplicacion");
      },
      {
          preferFrontCamera : false, 
          showFlipCameraButton : true, 
          showTorchButton : true, 
          torchOn: false, 
          formats : "QR_CODE"
      }
   );
  };

  $scope.$on('modal.hidden', function(e) {
    $scope.modalOK.remove();
  });

})

.directive('onlyDigits', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function (scope, element, attr, ctrl) {
      function inputValue(val) {
        if (val) {
          var digits = val.replace(/[^0-9]/g, '');

          if (digits !== val) {
            ctrl.$setViewValue(digits);
            ctrl.$render();
          }
          return parseInt(digits,10);
        }
        return undefined;
      }            
      ctrl.$parsers.push(inputValue);
    }
  };
});