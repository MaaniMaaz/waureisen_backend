// 1. Put your big JSON into a variable (or require it from a file)
const data = {
    "salesOffice": [
                {
                    "salesOfficeCode": "0505",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Rentals, S.L.",
                        "street": "Guitard, 45, 1°",
                        "country": "ES",
                        "zip": "08014",
                        "place": "Barcelona",
                        "phoneNumber": "+34 934 09 05 22",
                        "emailAddress": "info@interhome.es"
                    },
                    "termsUrl": "http://www.interhome.es/PDF.ashx?pdfDoc=1&langCode=ES",
                    "bank": {
                        "bankName": "Deutsche Bank S.A.E.",
                        "bankNumber": "",
                        "bankAccount": "00190020924010194080",
                        "swift": "DEUTESBBXXX",
                        "iban": "ES50 0019 0020 9240 1019 4080"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "ES",
                            "FR",
                            "IT",
                            "NL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "0515",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD Rentals, S.L.",
                        "addressLine2": "Sr. Sébastien Aribit",
                        "street": "Av. Alegries 24",
                        "country": "ES",
                        "zip": "17310",
                        "place": "Lloret de Mar",
                        "phoneNumber": "+34 0646360736",
                        "emailAddress": "lloret@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank S.A.E.",
                        "bankNumber": "",
                        "bankAccount": "00190020924010194080",
                        "swift": "DEUTESBBXXX",
                        "iban": "ES50 0019 0020 9240 1019 4080"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "ES",
                            "FR",
                            "IT",
                            "NL"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "0530",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD Rentals, S.L.",
                        "street": "Calle de la Burguera, 6",
                        "country": "ES",
                        "zip": "43840",
                        "place": "Salou",
                        "phoneNumber": "+34 977 44 91 47",
                        "emailAddress": "salou@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank S.A.E.",
                        "bankNumber": "",
                        "bankAccount": "00190020924010194080",
                        "swift": "DEUTESBBXXX",
                        "iban": "ES50 0019 0020 9240 1019 4080"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "ES",
                            "FR",
                            "IT",
                            "NL"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "0591",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Rentals, S.L., Sucursal em Portugal",
                        "street": "Rua General Humberto Delgado 2B",
                        "country": "PT",
                        "zip": "8200",
                        "place": "Guia, Albufeira",
                        "emailAddress": "albufeira@interhome.group"
                    },
                    "termsUrl": "http://www.interhome.pt/PDF.ashx?pdfDoc=1&langCode=PT",
                    "bank": {
                        "bankName": "",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "",
                        "iban": ""
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "PT"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "1010",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD GesmbH",
                        "addressLine2": "Menardi Center - DEZ",
                        "street": "Amraser See Straße 56",
                        "country": "AT",
                        "zip": "6029",
                        "place": "Innsbruck",
                        "phoneNumber": "+43 512 344090",
                        "emailAddress": "info@interhome.at"
                    },
                    "termsUrl": "http://www.interhome.at/PDF.ashx?pdfDoc=1&langCode=DE",
                    "bank": {
                        "bankName": "Deutsche Bank AG, Wien",
                        "bankNumber": "19100",
                        "bankAccount": "0031813000",
                        "swift": "DEUTATWWXXX",
                        "iban": "AT74 1910 0000 3181 3000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "IT",
                            "NL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "2020",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 91",
                        "emailAddress": "info@interhome.ch"
                    },
                    "termsUrl": "http://www.interhome.ch/PDF.ashx?pdfDoc=1&langCode=DE",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "TW",
                                    "type": "TWINT",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "CHF"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "IT",
                            "NL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "2048",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "2051",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 92 14",
                        "emailAddress": "hhd_airbnb@hhd.group"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 6,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 29,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "0.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "2057",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "2058",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 59,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "0.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "2059",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 59,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "0.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "2900",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 91",
                        "emailAddress": "info@interhome.ch"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "TW",
                                    "type": "TWINT",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "CHF"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "IT",
                            "NL"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3030",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD S.R.L.",
                        "street": "Corso Italia 1",
                        "country": "IT",
                        "zip": "20122",
                        "place": "Milano",
                        "phoneNumber": "+39 02 483 9141",
                        "emailAddress": "info@interhome.it"
                    },
                    "termsUrl": "http://www.interhome.it/PDF.ashx?pdfDoc=1&langCode=IT",
                    "bank": {
                        "bankName": "Deutsche Bank S.p.A.",
                        "bankNumber": "",
                        "bankAccount": "473820386",
                        "swift": "DEUTITM1463",
                        "iban": "IT26 A031 0401 6160 0000 0820 386"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "ES",
                            "FR",
                            "IT"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3031",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD S.R.L.",
                        "street": "Via Poerio 2A",
                        "country": "IT",
                        "zip": "20129",
                        "place": "Milano",
                        "phoneNumber": "+39 02 483 9141",
                        "emailAddress": "export@interhome.it"
                    },
                    "termsUrl": "http://www.interhome.it/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Deutsche Bank S.p.A.",
                        "bankNumber": "",
                        "bankAccount": "473820386",
                        "swift": "DEUTITM1463",
                        "iban": "IT26 A031 0401 6160 0000 0820 386"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "IT",
                            "NL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3535",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Limited",
                        "addressLine2": "Power Road Studios",
                        "street": "114 Power Road",
                        "country": "GB",
                        "zip": "W4 5PY",
                        "place": "London",
                        "phoneNumber": "+44 20 8068 9950",
                        "emailAddress": "info@interhome.co.uk"
                    },
                    "termsUrl": "http://www.interhome.co.uk/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "NatWest",
                        "bankNumber": "60-17-31",
                        "bankAccount": "72405643",
                        "swift": "NWBKGB2L",
                        "iban": "GB29NWBK60173172405643"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "GBP"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3536",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Limited",
                        "addressLine2": "Power Road Studios",
                        "street": "114 Power Road",
                        "country": "GB",
                        "zip": "W4 5PY",
                        "place": "London",
                        "phoneNumber": "+353 1 431 1086",
                        "emailAddress": "info.ie@hhd.group"
                    },
                    "termsUrl": "http://www.interhome.ie/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "NatWest",
                        "bankNumber": "60-17-31",
                        "bankAccount": "13030787",
                        "swift": "NWBKGB2L",
                        "iban": "GB56NWBK60720613030787"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3550",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD Limited",
                        "addressLine2": "Ground Floor",
                        "street": "5 Market Square",
                        "country": "GB",
                        "zip": "PL26 6UD",
                        "place": "Mevagissey",
                        "phoneNumber": "+44 7944 931144",
                        "emailAddress": "mevagissey@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "NatWest",
                        "bankNumber": "60-17-31",
                        "bankAccount": "72405643",
                        "swift": "NWBKGB2L",
                        "iban": "GB29NWBK60173172405643"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "GBP"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3570",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD Limited",
                        "street": "Unit 2 Carriers Croft",
                        "country": "GB",
                        "zip": "IV63 6AG",
                        "place": "Drumnadrochit",
                        "phoneNumber": "+44 1456 380016",
                        "emailAddress": "drumnadrochit@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "NatWest",
                        "bankNumber": "60-17-31",
                        "bankAccount": "72405643",
                        "swift": "NWBKGB2L",
                        "iban": "GB29NWBK60173172405643"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "GBP"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3571",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD Limited",
                        "addressLine2": "Station Square",
                        "street": "Grampian Road",
                        "country": "GB",
                        "zip": "PH22 1PD",
                        "place": "Aviemore",
                        "phoneNumber": "+44 1479 456000",
                        "emailAddress": "aviemore@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "NatWest",
                        "bankNumber": "60-17-31",
                        "bankAccount": "72405643",
                        "swift": "NWBKGB2L",
                        "iban": "GB29NWBK60173172405643"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "GBP"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3636",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "USD"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "ES",
                            "FR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3637",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "CAD"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "FR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3810",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD d.o.o.",
                        "street": "Valturska 78/5",
                        "country": "HR",
                        "zip": "52100",
                        "place": "Pula",
                        "phoneNumber": "+385 51 276 715",
                        "emailAddress": "pula@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "DEUTDE6F683",
                        "iban": "DE92 6837 0034 0036 6070 00"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "HR"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3830",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD d.o.o.",
                        "street": "Ulica Hrvatskog Sabora 8",
                        "country": "HR",
                        "zip": "23000",
                        "place": "Zadar",
                        "phoneNumber": "+385 51 276 715",
                        "emailAddress": "zadar@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "DEUTDE6F683",
                        "iban": "DE92 6837 0034 0036 6070 00"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "HR"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3838",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD d.o.o.",
                        "street": "Jurdani 99",
                        "country": "HR",
                        "zip": "51213",
                        "place": "Jurdani",
                        "phoneNumber": "+385 51 276 715",
                        "emailAddress": "info@interhome.hr"
                    },
                    "termsUrl": "http://www.interhome.hr/PDF.ashx?pdfDoc=1&langCode=HR",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "DEUTDE6F683",
                        "iban": "DE92 6837 0034 0036 6070 00"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "HR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "3840",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD d.o.o.",
                        "street": "Cesta Plano 115 A",
                        "country": "HR",
                        "zip": "21220",
                        "place": "Plano",
                        "phoneNumber": "+385 51 276 715",
                        "emailAddress": "trogir@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "DEUTDE6F683",
                        "iban": "DE92 6837 0034 0036 6070 00"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "HR"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "4040",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD B.V.",
                        "street": "Laan van Zuid Hoorn 70",
                        "country": "NL",
                        "zip": "2289 DE",
                        "place": "Rijswijk",
                        "phoneNumber": "+31 70 414 1000",
                        "emailAddress": "info@interhome.nl"
                    },
                    "termsUrl": "http://www.interhome.nl/PDF.ashx?pdfDoc=1&langCode=NL",
                    "bank": {
                        "bankName": "Deutsche Bank Nederland N.V.",
                        "bankNumber": "",
                        "bankAccount": "265123100",
                        "swift": "DEUTNL2A",
                        "iban": "NL71 DEUT 0265 1231 00"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "ID",
                                    "type": "IDEAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "NL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "4050",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD B.V.",
                        "street": "Scherminkelstraat 32",
                        "country": "NL",
                        "zip": "4381 GJ",
                        "place": "Vlissingen",
                        "emailAddress": "vlissingen@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank Nederland N.V.",
                        "bankNumber": "",
                        "bankAccount": "265123100",
                        "swift": "DEUTNL2A",
                        "iban": "NL71 DEUT 0265 1231 00"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "ID",
                                    "type": "IDEAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "NL"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "4444",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Sp. z o.o.",
                        "street": "St. Kostki Potockiego 24 B",
                        "country": "PL",
                        "zip": "02-958",
                        "place": "Warszawa",
                        "phoneNumber": "+48 22 642 23 84",
                        "emailAddress": "info@interhome.pl"
                    },
                    "termsUrl": "http://www.interhome.pl/PDF.ashx?pdfDoc=1&langCode=PL",
                    "bank": {
                        "bankName": "Bank Pekao S.A. VII/O Warszawa",
                        "bankNumber": "12401109",
                        "bankAccount": "20 1240 1109 1111 0000 0515 2573",
                        "swift": "PKOPPLPW",
                        "iban": ""
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "PLN"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HU",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "PT",
                            "RU",
                            "SV"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "4747",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Service AB",
                        "street": "Grev Turegatan 77",
                        "country": "SE",
                        "zip": "114 38",
                        "place": "Stockholm",
                        "phoneNumber": "+46 8 21 65 50",
                        "emailAddress": "info@interhome.se"
                    },
                    "termsUrl": "http://www.interhome.se/PDF.ashx?pdfDoc=1&langCode=SV",
                    "bank": {
                        "bankName": "Nordea Bank AB",
                        "bankNumber": "",
                        "bankAccount": "9960-1800315473, BG 210-3505",
                        "swift": "NDEASESS",
                        "iban": "SE 4295000099601800315473"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "SEK"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "SV"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "4750",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Service AB",
                        "street": "Grev Turegatan 77",
                        "country": "SE",
                        "zip": "114 38",
                        "place": "Stockholm",
                        "phoneNumber": "+45 70 23 36 33",
                        "emailAddress": "info@interhome.dk"
                    },
                    "termsUrl": "http://www.interhome.dk/PDF.ashx?pdfDoc=1&langCode=DA",
                    "bank": {
                        "bankName": "Nordea Bank Danmark A/S",
                        "bankNumber": "",
                        "bankAccount": "2040 7560 1512 89",
                        "swift": "NDEADKKK",
                        "iban": "DK 54 2000 7560 1512 89"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "DKK"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DA",
                            "DE",
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "4751",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Service AB",
                        "street": "Grev Turegatan 77",
                        "country": "SE",
                        "zip": "114 38",
                        "place": "Stockholm",
                        "phoneNumber": "+46 8 21 65 50",
                        "emailAddress": "info@interhome.no"
                    },
                    "termsUrl": "http://www.interhome.no/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Nordea Bank Norway",
                        "bankNumber": "",
                        "bankAccount": "6005.07.65418",
                        "swift": "NDEANOKK",
                        "iban": "NO0360050765418"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "NOK"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "NO"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "4848",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD s.r.o.",
                        "addressLine2": "Oasis Florenc",
                        "street": "Sokolovská 394/17",
                        "country": "CZ",
                        "zip": "186 00",
                        "place": "Praha 8",
                        "phoneNumber": "+420 222 323 323",
                        "emailAddress": "info@interhome.cz"
                    },
                    "termsUrl": "http://www.interhome.cz/PDF.ashx?pdfDoc=1&langCode=CS",
                    "bank": {
                        "bankName": "Komerční banka, a.s.",
                        "bankNumber": "0100",
                        "bankAccount": "19-5115620237",
                        "swift": "KOMBCZPPXXX",
                        "iban": "CZ9801000000195115620237"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "CZK"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DE",
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "5059",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD GmbH",
                        "street": "Heinrich-von-Stephan-Straße 25",
                        "country": "DE",
                        "zip": "79100",
                        "place": "Freiburg",
                        "phoneNumber": "+49 2421 1220",
                        "emailAddress": "info@interhome.de"
                    },
                    "termsUrl": "http://www.interhome.de/PDF.ashx?pdfDoc=1&langCode=DE",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0035610500",
                        "swift": "DEUTDE6F683",
                        "iban": "DE23 6837 0034 0035 6105 00"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DE",
                            "EN",
                            "ES",
                            "FR",
                            "IT",
                            "NL",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "5252",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "LLC HHD",
                        "street": "Staroalekseevskaya 5",
                        "country": "RU",
                        "zip": "129629",
                        "place": "Moscow",
                        "phoneNumber": "+7 495 504-08-99",
                        "emailAddress": "info@interhome.ru"
                    },
                    "termsUrl": "http://www.interhome.ru/PDF.ashx?pdfDoc=1&langCode=RU",
                    "bank": {
                        "bankName": "ОАО \"Промсвязьбанк\" г.Москва",
                        "bankNumber": "",
                        "bankAccount": "40702810870190281001",
                        "swift": "044525555",
                        "iban": ""
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "RUB"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "RU"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "5253",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "LLC HHD",
                        "street": "Balaklavskiy pr-t., 28B, str.1, of. 206",
                        "country": "RU",
                        "zip": "117452",
                        "place": "Moscow",
                        "phoneNumber": "+7 495 504-08-99",
                        "emailAddress": "info@interhome.ru"
                    },
                    "termsUrl": "http://www.interhome.ru/PDF.ashx?pdfDoc=1&langCode=RU",
                    "bank": {
                        "bankName": "",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "",
                        "iban": ""
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "RU"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "6060",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD NV",
                        "street": "Jan Emiel Mommaertslaan 20A – Bus 8",
                        "country": "BE",
                        "zip": "1831",
                        "place": "Diegem",
                        "phoneNumber": "+32 2 648 99 55",
                        "emailAddress": "info@interhome.be"
                    },
                    "termsUrl": "http://www.interhome.be/PDF.ashx?pdfDoc=1&langCode=FR",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "826",
                        "bankAccount": "826-0005000-70",
                        "swift": "DEUTBEBE",
                        "iban": "BE60 8260 0050 0070"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "NL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "6070",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD NV",
                        "street": "Kapelstraat 70",
                        "country": "BE",
                        "zip": "8450",
                        "place": "Bredene",
                        "phoneNumber": "+32 59 34 02 70",
                        "emailAddress": "bredene@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "826",
                        "bankAccount": "826-0005000-70",
                        "swift": "DEUTBEBE",
                        "iban": "BE60 8260 0050 0070"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "NL"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "6071",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD NV",
                        "street": "Markstraat 7",
                        "country": "BE",
                        "zip": "8420",
                        "place": "De Haan",
                        "phoneNumber": "+32 59 80 00 39",
                        "emailAddress": "dehaan@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "826",
                        "bankAccount": "826-0005000-70",
                        "swift": "DEUTBEBE",
                        "iban": "BE60 8260 0050 0070"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "NL"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "6072",
                    "name": "Interhome | Service Office",
                    "address": {
                        "addressLine1": "HHD NV",
                        "street": "Albertstraat 1 GLV",
                        "country": "BE",
                        "zip": "8370",
                        "place": "Blankenberge",
                        "phoneNumber": "+32 50 58 16 06",
                        "emailAddress": "blankenberge@interhome.group"
                    },
                    "termsUrl": "",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "826",
                        "bankAccount": "826-0005000-70",
                        "swift": "DEUTBEBE",
                        "iban": "BE60 8260 0050 0070"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "FR",
                            "NL"
                        ]
                    },
                    "cancelConditions": {},
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "7070",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Sarl",
                        "street": "15 Av Jean Aicard",
                        "country": "FR",
                        "zip": "75541",
                        "place": "Paris Cedex 11",
                        "phoneNumber": "+33 1 53 36 60 00",
                        "emailAddress": "info@interhome.fr"
                    },
                    "termsUrl": "http://www.interhome.fr/PDF.ashx?pdfDoc=1&langCode=FR",
                    "bank": {
                        "bankName": "Deutsche Bank AG - Paris",
                        "bankNumber": "17789",
                        "bankAccount": "10510545000",
                        "swift": "DEUTFRPP",
                        "iban": "FR76 1778 9000 0110 5105 4500 089"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 21
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "ECV",
                                    "type": "ECV",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "ES",
                            "FR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8048",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+49 761 210077",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "ES",
                            "FR",
                            "IT",
                            "NL",
                            "PL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 42,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8058",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+49 761 210077",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 42,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "20.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8059",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+49 761 210077",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 59,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "0.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8080",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+49 761 210077",
                        "emailAddress": "info@interhome.de"
                    },
                    "termsUrl": "http://www.interhome.de/PDF.ashx?pdfDoc=1&langCode=DE",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8081",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+44 20 8068 9960",
                        "emailAddress": "info@interhome.co.uk"
                    },
                    "termsUrl": "http://www.interhome.co.uk/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "NatWest",
                        "bankNumber": "60-17-31",
                        "bankAccount": "72405643",
                        "swift": "NWBKGB2L",
                        "iban": "GB29NWBK60173172405643"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "GBP"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 42,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8082",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Sarl",
                        "street": "15 Av Jean Aicard",
                        "country": "FR",
                        "zip": "75541",
                        "place": "Paris Cedex 11",
                        "phoneNumber": "+33 1 53 36 66 50",
                        "emailAddress": "info@interhome.fr"
                    },
                    "termsUrl": "http://www.interhome.fr/PDF.ashx?pdfDoc=1&langCode=FR",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "ECV",
                                    "type": "ECV",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "FR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 42,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8083",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+39 02 4839 1449",
                        "emailAddress": "info@interhome.it"
                    },
                    "termsUrl": "http://www.interhome.it/PDF.ashx?pdfDoc=1&langCode=IT",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "IT"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 42,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8084",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+31 70 414 1051",
                        "emailAddress": "info@interhome.nl"
                    },
                    "termsUrl": "http://www.interhome.nl/PDF.ashx?pdfDoc=1&langCode=NL",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "ID",
                                    "type": "IDEAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "NL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 42,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8085",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+34 935 45 05 56",
                        "emailAddress": "info@interhome.es"
                    },
                    "termsUrl": "http://www.interhome.es/PDF.ashx?pdfDoc=1&langCode=ES",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "ES"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 42,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8086",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD Sp. z o.o.",
                        "street": "St. Kostki Potockiego 24 B",
                        "country": "PL",
                        "zip": "02-958",
                        "place": "Warszawa",
                        "phoneNumber": "+48 22 642 23 84",
                        "emailAddress": "info@interhome.pl"
                    },
                    "termsUrl": "http://www.interhome.pl/PDF.ashx?pdfDoc=1&langCode=PL",
                    "bank": {
                        "bankName": "Deutsche Bank Polska S.A.",
                        "bankNumber": "18800009",
                        "bankAccount": "1150120002",
                        "swift": "DEUTPLPXXXX",
                        "iban": "PL48188000090000001150120002"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "PP",
                                    "type": "PAYPAL",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "PLN"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "PL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 42,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "8088",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+49 761 210077",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Deutsche Bank AG",
                        "bankNumber": "683 700 34",
                        "bankAccount": "0036 6070 02",
                        "swift": "DEUTDE6F683",
                        "iban": "DE38 6837 0034 0036 6070 02"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "DE",
                            "EN",
                            "ES",
                            "FR",
                            "IT",
                            "NL",
                            "PL"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 29,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "50.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "9541",
                    "name": "Interhome",
                    "address": {
                        "addressLine1": "HHD AG",
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com.au/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": " Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-1",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "AUD"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "9542",
                    "name": "Interhome Pty Ltd",
                    "address": {
                        "addressLine1": "Suite 5, Level 1, Building 7",
                        "street": "49 Frenchs Forest Rd",
                        "country": "AU",
                        "zip": "2086",
                        "place": "Frenchs Forest NSW",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "info@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com.au/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "NZD"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "9543",
                    "name": "Interhome AG",
                    "address": {
                        "street": "Sägereistrasse 20",
                        "country": "CH",
                        "zip": "8152",
                        "place": "Glattbrugg",
                        "phoneNumber": "+41 43 810 91 26",
                        "emailAddress": "tripadvisor@interhome.com"
                    },
                    "termsUrl": "http://www.interhome.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Credit Suisse, CH-8070 Zürich",
                        "bankNumber": "4835",
                        "bankAccount": "384154-11",
                        "swift": "CRESCHZZ80A",
                        "iban": "CH5104835038415411000"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 7
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "CS",
                            "DA",
                            "DE",
                            "EN",
                            "ES",
                            "FI",
                            "FR",
                            "HR",
                            "IT",
                            "NL",
                            "NO",
                            "PL",
                            "RU",
                            "SV",
                            "TR"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "9546",
                    "name": "Interhome Oy",
                    "address": {
                        "street": "Tolsankuja 3",
                        "country": "FI",
                        "zip": "02400",
                        "place": "Kirkkonummi",
                        "phoneNumber": "+358 9 8194050",
                        "emailAddress": "info@interhome.fi"
                    },
                    "termsUrl": "http://www.interhome.fi/PDF.ashx?pdfDoc=1&langCode=FI",
                    "bank": {
                        "bankName": "Nordea Pankki Oyj",
                        "bankNumber": "",
                        "bankAccount": "102830-213611",
                        "swift": "NDEAFIHH",
                        "iban": "FI84 1028 3000 2136 11"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "FI",
                            "FR",
                            "SV"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "9547",
                    "name": "Interhome Oy",
                    "address": {
                        "street": "Ulappakatu 1 J",
                        "country": "FI",
                        "zip": "02320",
                        "place": "Espoo",
                        "phoneNumber": "+358 9 8194050",
                        "emailAddress": "info@interhome.fi"
                    },
                    "termsUrl": "http://www.interhome.ee/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "Nordea Pankki Oyj",
                        "bankNumber": "",
                        "bankAccount": "102830-213611",
                        "swift": "NDEAFIHH",
                        "iban": "FI84 1028 3000 2136 11"
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "INV",
                                    "type": "",
                                    "daysBefore": 14
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN",
                            "FI"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "9560",
                    "name": "Interhome India-Fourways Travels Pvt Ltd",
                    "address": {
                        "street": "17, Raheja Centre, Nariman Point",
                        "country": "IN",
                        "zip": "400021",
                        "place": "Mumbai",
                        "phoneNumber": "+91 22 4353 0888",
                        "emailAddress": "jenaifer.daruwalla@interhome.in"
                    },
                    "termsUrl": "http://www.interhome.in/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "",
                        "iban": ""
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 1
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 1
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },
                {
                    "salesOfficeCode": "9565",
                    "name": "Interhome-Indian Sub Continent & GCC",
                    "address": {
                        "addressLine1": "GSA - Maison de Voyage Pvt Ltd",
                        "street": "17, Raheja Centre, Nariman Point",
                        "country": "IN",
                        "zip": "400021",
                        "place": "Mumbai",
                        "phoneNumber": "+91 22 4353 0888",
                        "emailAddress": "jenaifer.daruwalla@interhome.in"
                    },
                    "termsUrl": "http://www.interhomegcc.com/PDF.ashx?pdfDoc=1&langCode=EN",
                    "bank": {
                        "bankName": "",
                        "bankNumber": "",
                        "bankAccount": "",
                        "swift": "",
                        "iban": ""
                    },
                    "payment": {
                        "paymentForms": {
                            "paymentForm": [
                                {
                                    "mode": "CC",
                                    "type": "MAST",
                                    "daysBefore": 3
                                },
                                {
                                    "mode": "CC",
                                    "type": "VISA",
                                    "daysBefore": 3
                                }
                            ]
                        }
                    },
                    "currencies": {
                        "currency": [
                            "EUR"
                        ]
                    },
                    "languages": {
                        "language": [
                            "EN"
                        ]
                    },
                    "cancelConditions": {
                        "cancelCondition": [
                            {
                                "daysBefore": 1,
                                "percent": "100.0"
                            },
                            {
                                "daysBefore": 28,
                                "percent": "80.0"
                            },
                            {
                                "daysBefore": 59,
                                "percent": "50.0"
                            },
                            {
                                "daysBefore": 999,
                                "percent": "10.0"
                            }
                        ]
                    },
                    "cancelConditionsRetail": {}
                },

    ]
};

// 2. Extract just the codes
const salesOfficeCodes = data.salesOffice.map(o => o.salesOfficeCode);

// 3. API config
const API_BASE = 'https://ws.interhome.com/ih/b2b/V0100/accommodation/pricelistalldur';
const TOKEN = 'XD1mZXqcC6';
const PARTNER = 'CH1002557';

const fetch = require('node-fetch');  // npm install node-fetch@2

// Helper to fet339 one code
async function fetchFor(code, accommodationCode) {
    const url = `${API_BASE}/${accommodationCode}?SalesOffice=${encodeURIComponent(code)}&Los=true&Currency=CHF&RangeFromDate=2025-05-03`;
    const res = await fetch(url, {
        headers: {
            'Token': TOKEN,
            'PartnerId': PARTNER,
            'SalesOffice': code,
            'Accept': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
}

// Main execution
(async () => {
    const results = [];
    const fs = require('fs');
    const path = require('path');

    for (const code of salesOfficeCodes) {
        try {
            const accommodationCode = 'DK6960.611.1'; // Saas-fee venetz v1 was CH3906.866.1
            const json = await fetchFor(code, accommodationCode);
            results.push({
                salesOffice: code,
                result: json
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error(`Error for sales office ${code}:`, err.message);
            results.push({
                salesOffice: code,
                error: err.message
            });
        }
    }

    // Save results to a file
    const outputPath = path.join(__dirname, 'salesoffice_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to: ${outputPath}`);

    // Also log to console
    console.log(JSON.stringify(results, null, 2));
})();