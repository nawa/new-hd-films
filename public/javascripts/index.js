(function ($) {
    $(window).load(function () {
        $('#films-table').dataTable({
            'bSort': true,       // Disable sorting
            'iDisplayLength': 10,   //records per page
            'sDom': "t<'row'<'col-md-6'i><'col-md-6'p>>",
            'sPaginationType': 'bootstrap',
            'processing': true,
            'serverSide': true,
            'ajax': {
                'url': '/service/data',
                'type': 'POST'
            },
            'columnDefs': [
                {
                    "targets": 0,
                    "data": null,
                    "render": function (data, type, full, meta) {
                        return  '<div class="row">' +
                                '  <div class="col-xs-6 col-md-3">' +
                                '    <a href="http://www.kinopoisk.ru/film/' + data.kinopoisk_id +'" class="thumbnail">' +
                                '      <img src="' + data.img +'" alt="...">' +
                                '    </a>' +
                                '  </div>' +
                                '</div>';
                    }
                },

                {
                    "targets": 1,
                    "data": null,
                    "render": function (data, type, full, meta) {
                        debugger;
                        return 'Cell2: ' + data[1];
                    }
                }
            ]
        });
    });
})(jQuery);

