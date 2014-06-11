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
                        return 'Cell1: ' + data[0];
                    }
                },

                {
                    "targets": 1,
                    "data": null,
                    "render": function (data, type, full, meta) {
                        return 'Cell2: ' + data[1];
                    }
                }
            ]
        });
    });
})(jQuery);

