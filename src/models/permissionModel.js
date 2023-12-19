import mongoose from "mongoose";

const permissionSchema = mongoose.Schema(
  {
    controller: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    enabled: {
      type: String,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

permissionSchema.index({controller:1, action:1}, {unique:true});

permissionSchema.set('toJSON')

const Permission = mongoose.model('permissions', permissionSchema);

export default Permission