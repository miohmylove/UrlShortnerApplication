$(document).ready(function() {

    $('.shortened_url').hide();
    $('.error-msg').hide();
    get_analtics();

    function get_analtics() {
        $.ajax({
            type: 'GET',
            datatype: 'json',
            url: '/get_analtics',
            success: function(output) {
                console.log(output);
                console.log(output.urlList);
                list = '';
                if(output.urlList.length) {
                    $.each(output.urlList, function(i, item) {
                        list += '<tr> <td>' + item.originalUrl + '</td> <td>' + item.shortenedUrl + '</td> <td>' + item.noOfHits + '</td> </tr>'
                    })
                    console.log(list);
                }
                $('.analytics_list').html(list);
            }
        });
    }

    $('.get_url').click(function() {
        url = $('#url').val();
        console.log(url);
        
        if(url != '') {
            $('.error-msg').hide();
            $.ajax({
                type: 'POST',
                datatype: 'json',
                data: {url: url},
                url: '/get_shortened_url',
                success: function(output) {
                    $('.shortened_url').show();
                    $('.new_url').html(output.shortenedUrl);
    
                    get_analtics();
                }
            });
        }
        else {
            $('.error-msg').show();
            $('.error-msg').html('URL is required');
        }
    });
});