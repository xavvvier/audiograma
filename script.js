angular.module('sample', ['audiograma'])
   .controller('SampleCtrl', ['$scope', function($scope){
      $scope.registro = {
         Volumen: [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
         Frecuencia: [250, 500, 1000, 2000, 3000, 4000, 6000, 8000],
         Aerea: {
            //Registros de ejemplo
            Derecho: [22.5, 23, 24, 26, 23.4],
            Izquierdo: [20.7, 17.3, 15, 17, 30, 35, 42.2]
         }
      };
   }])
