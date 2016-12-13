import './blotter_chart.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import Highcharts from 'highcharts';

Template.blotter_chart.onRendered(function portfolioChartOnRendered() {
  this.$('#container').highcharts({
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie',
    },
    title: {
      text: 'Portfolio composition',
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
          },
        },
      },
    },
    series: [{
      name: 'Brands',
      colorByPoint: true,
      data: [{
        name: 'Ethereum (ETH)',
        y: 100,
      }, {
        name: 'Ethereum Classics (ETC)',
        y: 10,
      }, {
        name: 'Augur (REP)',
        y: 10,
      }, {
        name: 'Digix Gold (DGX)',
        y: 50,
      }, {
        name: 'MakerDAO (MKR)',
        y: 10,
      }, {
        name: 'Melon (MLN)',
        y: 1,
        sliced: true,
        selected: true,
      }],
    }],
  });
});
