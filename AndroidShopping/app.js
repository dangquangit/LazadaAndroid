var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var multiparty = require('multiparty');
var datetime = require('node-datetime');
var SERVER = "http://192.168.1.108/weblazada";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


// default route
app.get('/', function (req, res) {
    return res.send({error: true, message: 'hello'})
});
// connection configurations
var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'lazada'
});

// connect to database
dbConn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


// Retrieve all users 
// app.get('/users', function (req, res) {
//     dbConn.query('SELECT * FROM users', function (error, results, fields) {
//         if (error) throw error;
//         return res.send({ users: results });
//     });
// });

app.get("/get_list_users", function(req, res) {
    dbConn.query("SELECT * FROM users", function(error, results, fields) {
        if (error) throw error;
        return res.send(results);
    });
});

// http://192.168.100.7:8000/LayDanhSachMenu   form-data: maloaicha = 0
app.post("/LayDanhSachMenu", function(req, res) {
    if (req.method === "POST") {
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            // console.log(fields['maloaicha'][0]);
            if (err) {
                console.log(err);
            } else {
                // console.log(fields['maloaicha'][0]);
                sql = "SELECT *  FROM loaisanpham WHERE MALOAI_CHA = " + fields["maloaicha"];

                console.log(sql);
                dbConn.query(sql, function(error, results, fields) {
                    if (error) throw error;
                    return res.send(results);
                });
            }
        });
    }
});
app.get("/LaySanPhamVsChiTiet/:masp", (req, res) => {
    let { masp } = req.params;
    dbConn.query(`SELECT * FROM sanpham where MASP = '${masp}'`, function(error, results, fields) {
        if (error) throw error;
        let row = results[0];
        dbConn.query(`SELECT * FROM chitietsanpham where MASP = '${masp}'`, function(error, results, fields) {
            if (error) throw error;
            row.THONGSOKYTHUAT = results;
            return res.send(row);
        });
    });
});

app.get("/LaySanPhamTest", (req, res) => {
    console.log("lay san pham chi tiet: ", req.query.masp);
    // let { masp } = req.params;
    const { masp } = req.query;
    dbConn.query(`SELECT * FROM sanpham where MASP = '${masp}'`, (error, results, fields) => {
        if (error) throw error;
        let row = results[0];
        dbConn.query(`SELECT * FROM chitietsanpham where MASP = '${masp}'`, (error2, results2, fields2) => {
            if (error2) throw error2;
            row.THONGSOKYTHUAT = results2;
            console.log(row);
            dbConn.query(`SELECT TENNV FROM nhanvien where MANV = '${row.MANV}'`, (error3, results3, fields3) => {
                if (error3) {
                    console.log(error3);
                }
                console.log("res 3: ", results3);
                row.TENNHANVIEN = results3[0].TENNV;
                console.log(row);
                return res.send(row);
            });
            // return res.send(row);
        });
        // return res.send(row);
    });
});

app.get("/LayDanhSachDanhGiaTheoMASP", (req, res) => {
    console.log("lay san pham chi tiet: ", req.query.masp, "limit: ", req.query.limit);
    // let { masp } = req.params;
    const { masp, limit } = req.query;
    dbConn.query(`SELECT * FROM danhgia where MASP = ${masp} ORDER BY NGAYDANHGIA DESC LIMIT ${limit}, 10 `, (error, results, fields) => {
        if (error) throw error;
        let row = results;
        console.log(row);
        return res.send(row);
    });
});
app.get("/LayDanhSachTopPhuKien", function(req, res) {
    sql = "SELECT *  FROM loaisanpham lsp WHERE lsp.TENLOAISP LIKE 'phụ kiện điện thoại%'";
    var phukien;
    console.log(sql);
    var promise = new Promise(function(resolve, reject) {
        dbConn.query(sql, function(error, results, fields) {
            if (error) {
                reject("Error!");
                throw error;
            } else {
                resolve(results);
            }
        });
    });
    var list = [];
    promise.then(function(inparams) {
        console.log(inparams);
        inparams.forEach(value => {
            sql =
                "SELECT lsp.MALOAISP as MATHUONGHIEU, lsp.TENLOAISP as TENTHUONGHIEU, CONCAT('" +
                SERVER +
                "', sp.ANHLON) as HINHTHUONGHIEU  FROM loaisanpham lsp, sanpham sp WHERE lsp.MALOAI_CHA = " +
                value.MALOAISP +
                " AND lsp.MALOAISP = sp.MALOAISP ORDER BY sp.LUOTMUA DESC LIMIT 10";
            console.log(sql);
            dbConn.query(sql, function(error, results, fields) {
                if (error) {
                    console.log(error);
                    throw error;
                } else {
                    return res.send(results);
                }
            });
        });
    });
});

app.get("/LayDanhSachPhuKien", function(req, res) {
    sql = "SELECT *  FROM loaisanpham lsp WHERE lsp.TENLOAISP LIKE 'phụ kiện điện thoại%'";
    var phukien;
    console.log(sql);
    var promise = new Promise(function(resolve, reject) {
        dbConn.query(sql, function(error, results, fields) {
            if (error) {
                reject("Error!");
                throw error;
            } else {
                resolve(results);
            }
        });
    });

    var list = [];
    promise.then(function(inparams) {
        console.log("==============");
        console.log(inparams.length);
        console.log(inparams);
        inparams.forEach(value => {
            sql =
                "SELECT sp.MASP, sp.TENSP, sp.GIA AS GIATIEN, CONCAT('" +
                SERVER +
                "', sp.ANHLON) as HINHSANPHAM FROM loaisanpham lsp, sanpham sp WHERE lsp.MALOAI_CHA = " +
                value.MALOAISP +
                " AND lsp.MALOAISP = sp.MALOAISP ORDER BY sp.LUOTMUA DESC LIMIT 10";
            console.log(sql);
            dbConn.query(sql, function(error, results, fields) {
                if (error) {
                    console.log(error);
                    throw error;
                } else {
                    return res.send(results);
                }
            });
        });
    });
});

app.get("/LayDanhSachTienIch", function(req, res) {
    sql = "SELECT *  FROM loaisanpham lsp WHERE lsp.MALOAISP = 82";
    var phukien;
    console.log(sql);
    var promise = new Promise(function(resolve, reject) {
        dbConn.query(sql, function(error, results, fields) {
            if (error) {
                reject("Error!");
                throw error;
            } else {
                resolve(results);
            }
        });
    });

    console.log("-----------------------------------LayDanhSachTienIch --------------------------");
    var list = [];
    promise.then(function(inparams) {
        console.log(inparams);
        inparams.forEach(value => {
            sql = "SELECT *  FROM loaisanpham lsp WHERE lsp.MALOAI_CHA = " + value.MALOAISP;
            console.log(sql);
            var promise1 = new Promise(function(resolve, reject) {
                dbConn.query(sql, function(error, results, fields) {
                    if (error) {
                        reject("Error!");
                        throw error;
                    } else {
                        resolve(results);
                    }
                });
            });

            console.log("-----------------------------------LayDanhSachTienIchSanPham --------------------------");
            var list = [];
            promise1.then(function(input) {
                console.log(input);
                var arr = [];
                var index = 0;
                input.forEach(obj => {
                    console.log("=======obj=======");
                    console.log(obj);

                    sql =
                        "SELECT MASP, TENSP, GIA AS GIATIEN, CONCAT('" +
                        SERVER +
                        "', ANHLON) as HINHSANPHAM FROM loaisanpham lsp, sanpham sp WHERE lsp.MALOAISP = " +
                        obj.MALOAISP +
                        " AND lsp.MALOAISP = sp.MALOAISP ORDER BY sp.LUOTMUA DESC LIMIT 1";
                    console.log(sql);
                    dbConn.query(sql, function(error, results, fields) {
                        if (error) {
                            console.log(error);
                            throw error;
                        } else {
                            // console.log("result: " + JSON.stringify(results));
                            if (results[0] != null) {
                                arr.push(results[0]);
                            }

                            // console.log("======== input length ======");
                            index++;
                            // console.log(input.length);
                            if (index == input.length) {
                                return res.send(arr);
                            }
                            // console.log(arr);
                        }
                    });
                });
            });
        });
    });
});

app.get("/LayDanhSachTopTienIch", function(req, res) {
    sql = "SELECT *  FROM loaisanpham lsp WHERE lsp.MALOAISP = 82";
    var phukien;
    console.log(sql);
    var promise = new Promise(function(resolve, reject) {
        dbConn.query(sql, function(error, results, fields) {
            if (error) {
                reject("Error!");
                throw error;
            } else {
                resolve(results);
            }
        });
    });

    console.log("-----------------------------------LayDanhSachTopTienIch --------------------------");
    var list = [];
    promise.then(function(inparams) {
        console.log(inparams);
        inparams.forEach(value => {
            sql = "SELECT *  FROM loaisanpham lsp WHERE lsp.MALOAI_CHA = " + value.MALOAISP;
            console.log(sql);
            var promise1 = new Promise(function(resolve, reject) {
                dbConn.query(sql, function(error, results, fields) {
                    if (error) {
                        reject("Error!");
                        throw error;
                    } else {
                        resolve(results);
                    }
                });
            });

            console.log("-----------------------------------LayDanhSachTopTienIchSanPham --------------------------");
            var list = [];
            promise1.then(function(input) {
                console.log(input);
                var arr = [];
                var index = 0;
                input.forEach(obj => {
                    // console.log("=======obj=======")
                    // console.log(obj);
                    sql =
                        "SELECT lsp.MALOAISP as MATHUONGHIEU, lsp.TENLOAISP as TENTHUONGHIEU, CONCAT('" +
                        SERVER +
                        "', sp.ANHLON) as HINHTHUONGHIEU FROM loaisanpham lsp, sanpham sp WHERE lsp.MALOAISP = " +
                        obj.MALOAISP +
                        " AND lsp.MALOAISP = sp.MALOAISP ORDER BY sp.LUOTMUA DESC LIMIT 10";
                    console.log(sql);
                    dbConn.query(sql, function(error, results, fields) {
                        if (error) {
                            console.log(error);
                            throw error;
                        } else {
                            // console.log("result: " + JSON.stringify(results));
                            if (results[0] != null) {
                                arr.push(results[0]);
                            }
                            index++;
                            if (index == input.length) {
                                var i = 0;
                                while (i < index) {
                                    arr.push(arr[i]);
                                    i++;
                                }
                                return res.send(arr);
                            }
                        }
                    });
                });
            });
        });
    });
});

// SELECT th.MATHUONGHIEU, th.TENTHUONGHIEU, cth.HINHLOAISPTH as HINHTHUONGHIEU  FROM thuonghieu th,chitietthuonghieu cth WHERE th.MATHUONGHIEU = cth.MATHUONGHIEU
app.get("/LayDanhSachCacThuongHieuLon", function(req, res) {
    console.log(req.url);
    var os = require("os");

    console.log(os.hostname() + " ======================LayDanhSachCacThuongHieuLon======================");
    dbConn.query(
        'SELECT th.MATHUONGHIEU, th.TENTHUONGHIEU, CONCAT("' +
        SERVER +
        '", cth.HINHLOAISPTH) as HINHTHUONGHIEU  FROM thuonghieu th,chitietthuonghieu cth WHERE th.MATHUONGHIEU = cth.MATHUONGHIEU',
        function(error, results, fields) {
            if (error) throw error;
            // console.log(results);
            return res.send(results);
        }
    );
});

app.get("/LayDanhSachTopDienThoaiVaMayTinhBang", function(req, res) {
    sql =
        "SELECT MASP, TENSP, GIA AS GIATIEN, CONCAT('" +
        SERVER +
        "', ANHLON) as HINHSANPHAM  FROM loaisanpham lsp, sanpham sp WHERE lsp.TENLOAISP LIKE 'điện thoại%' AND lsp.MALOAISP = sp.MALOAISP ORDER BY sp.LUOTMUA DESC LIMIT 10";
    var phukien;
    console.log(sql);
    var promise = new Promise(function(resolve, reject) {
        dbConn.query(sql, function(error, results, fields) {
            if (error) {
                reject("Error!");
                throw error;
            } else {
                resolve(results);
            }
        });
    });

    var list = [];
    promise.then(function(inparams) {
        console.log(inparams);
        sql =
            "SELECT MASP, TENSP, GIA AS GIATIEN, CONCAT('" +
            SERVER +
            "', ANHLON) as HINHSANPHAM  FROM loaisanpham lsp, sanpham sp WHERE lsp.TENLOAISP LIKE 'máy tính bảng%' AND lsp.MALOAISP = sp.MALOAISP ORDER BY sp.LUOTMUA DESC LIMIT 10";
        console.log(sql);
        dbConn.query(sql, function(error, results, fields) {
            if (error) {
                console.log(error);
                throw error;
            } else {
                var arr = [];
                if (inparams != null) {
                    inparams.forEach(obj => {
                        arr.push(obj);
                    });
                }

                if (results != null) {
                    results.forEach(obj => {
                        arr.push(obj);
                    });
                }

                return res.send(arr);
            }
        });
    });
});

//
app.get("/LayLogoCacThuongHieuLon", function(req, res) {
    dbConn.query(
        'SELECT th.MATHUONGHIEU, th.TENTHUONGHIEU , CONCAT("' + SERVER + '", th.HINHTHUONGHIEU) as HINHTHUONGHIEU FROM thuonghieu th',
        function(error, results, fields) {
            if (error) throw error;
            // console.log(results);
            return res.send(results);
        }
    );
});

app.get("/LayDanhSachSanPhamTheoMaLoaiThuongHieu", function(req, res) {
    var sql =
        "SELECT MASP, TENSP, GIA AS GIATIEN, CONCAT('" +
        SERVER +
        "', ANHLON) as HINHSANPHAM, CONCAT('" +
        SERVER +
        "', ANHNHO) as HINHSANPHAMNHO  FROM thuonghieu th, sanpham sp WHERE th.MATHUONGHIEU = " +
        req.query.maloai +
        " AND th.MATHUONGHIEU = sp.MATHUONGHIEU ORDER BY sp.LUOTMUA DESC LIMIT 20";
    console.log(sql);
    dbConn.query(sql, function(error, results, fields) {
        if (error) throw error;
        console.log(results);
        return res.send(results);
    });
});

app.get("/LayDanhSachSanPhamDanhMucTheoMaLoai", function(req, res) {
    var sql =
        "SELECT sp.MASP, sp.TENSP, sp.GIA AS GIATIEN, CONCAT('" +
        SERVER +
        "', sp.ANHLON) as HINHSANPHAM, CONCAT('" +
        SERVER +
        "', sp.ANHNHO) as HINHSANPHAMNHO  FROM loaisanpham lsp, sanpham sp WHERE lsp.MALOAISP = " +
        req.query.maloai +
        " AND lsp.MALOAISP = sp.MALOAISP ORDER BY sp.LUOTMUA DESC LIMIT 20";
    console.log(sql);
    dbConn.query(sql, function(error, results, fields) {
        if (error) throw error;
        console.log(results);
        return res.send(results);
    });
});
app.post("/DangKyThanhVien", function(req, res) {
    if (req.method === "POST") {
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            console.log(fields);
            res.send({
                result: true
            });
        });
    }
});

app.post("/thanhtoan", (req, res) => {
    const data = JSON.parse(req.query.hoadon);
    console.log("thanh toan: ", data);
    var dt = datetime.create();
    var formattedDate = dt.format("Y/m/d");
    let MaCK = data.MaChuyenKhoan ? data.MaChuyenKhoan : " ";
    let sql =
        `INSERT INTO hoadon (NGAYMUA,NGAYGIAO,TRANGTHAI,TENNGUOINHAN,SODT,DIACHI,CHUYENKHOAN,MACHUYENKHOAN) VALUES ('${formattedDate}','${formattedDate}',` +
        ` 'chờ kiếm duyệt',
    '${data.TenNguoiNhan}', '${data.SoDT}', '${data.DiaChi}',${data.ChuyenKhoan}, '${MaCK}');`;
    dbConn.query(sql, (error, results, fields) => {
        if (error) throw error;
        let chitiet = data.chiTietHoaDonList;
        chitiet.forEach(item => {
            dbConn.query(
                `INSERT INTO chitiethoadon (MAHD, MASP, SOLUONG) VALUES (${results.insertId},${item.MaSP},${item.SoLuong});`,
                (error2, results2, fields2) => {
                    if (error2) throw error;
                    return res.send("true");
                }
            );
        });
    });
});

app.post("/DangNhap", (req, res) => {
    if (req.method === "POST") {
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, file) {
            console.log(fields);
            if (err) {
                console.log(err);
            } else {
                sql = 'SELECT * FROM nhanvien WHERE TENDANGNHAP = ' + fields.username[0] + ' AND MATKHAU = ' + fields.password[0];
                dbConn.query(sql, function(err, result, fields) {
                    var userRs = JSON.parse(JSON.stringify(result[0]));
                    var user = {
                        name: userRs.TENNV,
                        phone: userRs.SODT,
                        address: userRs.DIACHI
                    };
                    console.log(user);
                    if (err) throw err;
                    if (result.length === 0) {
                        res.send({
                            result: false
                        });
                    } else {
                        res.send({
                            result: true,
                            user: user
                        });
                    }
                });
            }
        });
    }
});

app.get("/LayDanhSachKhuyenMai", (req, res) => {
    var dt = datetime.create();
    var formattedDate = dt.format("Y/m/d");
    var sql =
        'SELECT * FROM chitietkhuyenmai ctkm, sanpham sp, khuyenmai km, loaisanpham lsp  WHERE ctkm.MAKM = ANY (SELECT km.MAKM FROM khuyenmai km, loaisanpham lsp WHERE DATEDIFF(km.NGAYKETTHUC,"2019/05/27") >=0 AND km.MALOAISP = lsp.MALOAISP)  AND ctkm.MASP = sp.MASP AND km.MAKM = ctkm.MAKM AND sp.MALOAISP = lsp.MALOAISP';
    console.log(sql);
    dbConn.query(sql, function(err, result, fields) {
        var khuyenMaiRs = JSON.parse(JSON.stringify(result));
        console.log(khuyenMaiRs.length);
        var khuyenmaiReturn = [];
        var listMakm = [];

        for (var i = 0; i < khuyenMaiRs.length; i++) {
            if (!listMakm.includes(khuyenMaiRs[i].MAKM.toString())) {
                listMakm.push(khuyenMaiRs[i].MAKM.toString());
            }
        }
        console.log(listMakm);
        var makmTemp = "";
        for (var j = 0; j < listMakm.length; j++) {
            for (var k = 0; k < khuyenMaiRs.length; k++) {
                if (listMakm[j] === khuyenMaiRs[k].MAKM.toString() && khuyenMaiRs[k].MAKM.toString() !== makmTemp) {
                    makmTemp = khuyenMaiRs[k].MAKM.toString();
                    khuyenmaiObj = {
                        MAKM: khuyenMaiRs[k].MAKM,
                        MALOAISP: khuyenMaiRs[k].MALOAISP,
                        TENKM: khuyenMaiRs[k].TENKM,
                        NGAYBATDAU: khuyenMaiRs[k].NGAYBATDAU,
                        NGAYKETTHUC: khuyenMaiRs[k].NGAYKETTHUC,
                        HINHKHUYENMAI: khuyenMaiRs[k].HINHKHUYENMAI,
                        TENLOAISP: khuyenMaiRs[k].TENLOAISP,
                        DANHSACHSANPHAMKHUYENMAI: []
                    };

                    khuyenmaiReturn.push(khuyenmaiObj);
                }
            }
        }

        for (var i = 0; i < khuyenmaiReturn.length; i++) {
            var khuyenmaiObj = {};
            var sanPhamKhuyenMaiList = [];
            for (var j = 0; j < khuyenMaiRs.length; j++) {
                if (khuyenmaiReturn[i].MAKM.toString() === khuyenMaiRs[j].MAKM.toString()) {
                    var sanPhamKhuyenMai = {
                        MASP: khuyenMaiRs[j].MASP,
                        GIA: khuyenMaiRs[j].GIA,
                        SOLUONG: khuyenMaiRs[j].SOLUONG,
                        MALOAISP: khuyenMaiRs[j].MALOAISP,
                        MATHUONGHIEU: khuyenMaiRs[j].MATHUONGHIEU,
                        LUOTMUA: khuyenMaiRs[j].LUOTMUA,
                        ANHLON: khuyenMaiRs[j].ANHLON,
                        ANHNHO: khuyenMaiRs[j].ANHNHO,
                        THONGTIN: khuyenMaiRs[j].THONGTIN,
                        TENSP: khuyenMaiRs[j].TENSP,
                        CHITIETKHUYENMAI: {
                            MAKM: khuyenMaiRs[j].MAKM,
                            MASP: khuyenMaiRs[j].MASP,
                            PHANTRAMKM: khuyenMaiRs[j].PHANTRAMKM
                        }
                    };
                    sanPhamKhuyenMaiList.push(sanPhamKhuyenMai);
                }
            }
            khuyenmaiReturn[i].DANHSACHSANPHAMKHUYENMAI = sanPhamKhuyenMaiList;
        }
        console.log("danh sach KM hahaa", khuyenmaiReturn[0].DANHSACHSANPHAMKHUYENMAI);
        if (khuyenmaiReturn.length != 0) {
            res.send(khuyenmaiReturn);
        } else {
            res.send([]);
        }
    });
});

// set port
app.listen(8000, function () {
    console.log('Node app is running on port 8000');
});

module.exports = app;