(function ($) {
    $(window).load(function () {
        $('#films-table').dataTable({
            'iDisplayLength': 5,   //records per page
            'sDom': "t<'row'<'col-md-6'i><'col-md-6'p>>",
            'sPaginationType': 'bootstrap',
            'processing': true,
            'serverSide': true,
            'aaSorting': [],
            "autoWidth": false,
            'ajax': {
                'url': '/service/data',
                'type': 'POST'
            },
            'columnDefs': [
                {
                    "targets": 0,
                    "data": null,
                    "sWidth": "25%",
                    "bSortable": false,
                    "render": function (data, type, full, meta) {
                        return  '<div>' +
                                '    <a href="http://www.kinopoisk.ru/film/' + data.kinopoisk_id +'" class="thumbnail">' +
                                '      <img class="img-responsive" src="' + data.img +'" alt="...">' +
                                '    </a>' +
                                '   <h4 class="text-center">' + data.title + '</h4>' +
                                '   <div class="text-center">' + data.alternativeTitle + '</div>' +
                                '</div>';
                    }
                },
                {
                    "targets": 1,
                    "data": null,
                    "sWidth": "50%",
                    "bSortable": false,
                    "render": function (data, type, full, meta) {
                        return data.description;
                    }
                },
                {
                    "targets": 2,
                    "data": null,
                    "bSortable": true,
                    "render": function (data, type, full, meta) {
                        return '<div class="text-center">' + data.year + '</div>';
                    }
                },
                {
                    "targets": 3,
                    "data": null,
                    "bSortable": true,
                    "render": function (data, type, full, meta) {
                        return '<div class="text-center">' + data.rating + '</div>';
                    }
                },
                {
                    "targets": 4,
                    "data": null,
                    "bSortable": true,
                    "render": function (data, type, full, meta) {
                        return '<div class="text-center">' + data.votes + '</div>';
                    }
                }
            ]
        });
    });
})(jQuery);

