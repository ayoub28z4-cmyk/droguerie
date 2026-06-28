<?php

return [

    'defaults' => [
        'guard'     => 'personnel',
        'passwords' => 'personnel',
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'users',
        ],

        'personnel' => [
            'driver'   => 'sanctum',
            'provider' => 'personnel',
        ],

        'client' => [
            'driver'   => 'sanctum',
            'provider' => 'clients',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Personnel::class,
        ],

        'personnel' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Personnel::class,
        ],

        'clients' => [
            'driver' => 'eloquent',
            'model'  => App\Models\ClientAccount::class,
        ],
    ],

    'passwords' => [
        'personnel' => [
            'provider' => 'personnel',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];
