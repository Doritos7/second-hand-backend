const { user, user_detail, image } = require("../../models");
const response = require("../../../utils/formatResponse")
const { encrypt } = require('../../../utils/encrypt')

module.exports = {
     /* User Detail */
    putUserDetail: async (req, res) => {
        try {
            const jwtData = req.user  // Ngambil Data dari req.body isinya data user, didapat dari passport-JWT
            const { name, city, address, phone, image_url } = req.body
            const userData = await user.findOne({  
                where: { id: jwtData.id }, 
                include: { model: user_detail }
            })
            if(image_url){
                const imageSearch = await image.findOne({ where: { url: image_url } })
                if(!imageSearch) { return response(res, 400, false, `Foto ${image_url} tidak ditemukan.`) }
            }
            if (!userData) { return response(res, 404, false, 'Pengguna tidak ditemukan', null) }
            const updatedUserDetail= await userData.user_detail.update({                
                name: name, city: city, address: address, phone: phone, image: image_url
            })
            if (updatedUserDetail) { return response(res, 200, true, 'Rincian pengguna di update!', updatedUserDetail) }
            return response(res, 400, false, 'Gagal update!', null)

        } catch (error) {
            console.log(error); // setiap catch harus ada ini
            if (error.name === 'SequelizeDatabaseError') { // Bisa tau name error coba liat di console, ada bagian error name.. 
                return response(res, 400, false, error.message, null);
            } else if (error.name === 'SequelizeValidationError') { // Ketika Validasi Dari Input Salah, Bisa tau name error coba liat di console, ada bagian error name.. 
                return response(res, 400, false, error.errors[0].message, null);
            } // Kalau mau nambahin lagi boleh, tinggal namenya error di else if
            return response(res, 500, false, "Server Internal lagi error nih", null); // Jika Error Lainnya, 
        }
    },
    getUserDetail: async (req, res) => { 
        try {
            const jwtData = req.user; // Ngambil Data dari req.body isinya data user, didapat dari passport-JWT
            const userDetail = await user_detail.findOne({ 
                where: { user_id: jwtData.id }
            });
            if (!userDetail) { return response(res, 404, false, 'Rincian pengguna tidak ditemukan', userDetail) }
            return response(res, 200, true, 'Berhasil', userDetail);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },
    getProfile: async (req, res) => { 
        try {
            const jwtData = req.user;
            const profileData = await user.findOne({ 
                where: { id: jwtData.id },
                attributes: ['id', 'email'],
                include: [
                    { model: user_detail, attributes: ['name', 'image'] }
                ],
            })
            if (!profileData) { return response(res, 404, false, 'Pengguna tidak ditemukan', null ) }
            return response(res, 200, true, 'Berhasil', {
                id: profileData.id,
                email: profileData.email,
                name: profileData.user_detail.name,
                photo: profileData.user_detail.image
            });
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },  
    putResetPassword: async (req, res) => {
        try {
            const { password, new_password } = req.body
            const jwtData = req.user;
            if(!password || !new_password) { return response(res, 400, false, 'Password tidak boleh kosong!', null) }
            const userData = await user.findOne({ where: { id: jwtData.id } })
            if (!userData) { return response(res, 404, false, 'Pengguna tidak ditemukan', null) }
            if (!userData.checkPassword(password)) { 
                return response(res, 400, false, 'Password salah', null) 
            }
            const newPassword = encrypt(new_password)
            const updatedUser = await userData.update({  password: newPassword })
            
            const dataResponse = updatedUser.dataValues
            delete dataResponse.password
            delete dataResponse.createdAt
            delete dataResponse.is_verified
            
            if (updatedUser) { return response(res, 200, true, 'Berhasil update password', dataResponse) }
            return response(res, 400, false, 'Gagal update password', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    }
}