class Camera
{
    constructor()
    {
        this.fov = 60;

        this.eye = new Vector3([0, 0, 3]);

        this.at = new Vector3([0, 0, -100]);

        this.up = new Vector3([0, 1, 0]);

        this.viewMat = new Matrix4();

        this.projMat = new Matrix4();

        this.viewMat.setLookAt(
            this.eye.elements[0],
            this.eye.elements[1],
            this.eye.elements[2],

            this.at.elements[0],
            this.at.elements[1],
            this.at.elements[2],

            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );

        this.projMat.setPerspective(
            this.fov,
            canvas.width / canvas.height,
            0.1,
            1000
        );
    }

    moveForward()
    {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(0.2);
        this.eye.add(f);
        this.at.add(f);
        
        //update
        this.updateView();
    }

    moveBackwards()
    {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(0.2);
        this.eye.add(b);
        this.at.add(b);

        //update
        this.updateView();
    }

    moveLeft()
    {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(0.2);
        this.eye.add(s);
        this.at.add(s);

        //update
        this.updateView();
    }

    moveRight()
    {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(0.2);
        this.eye.add(s);
        this.at.add(s);

        //update
        this.updateView();
    }

    panLeft() 
    {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(2, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);

        //update
        this.updateView();
    }

    panRight() 
    {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-2, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);

        //update
        this.updateView();
    }

    //camera rotate
    panMouse(angle)
    {
        let f = new Vector3();

        f.set(this.at);

        f.sub(this.eye);

        let rotationMatrix = new Matrix4();

        rotationMatrix.setRotate(
            angle,
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);

        this.at.add(f_prime);

        this.updateView();
    }

    panMouseVertical(angle)
    {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        // compute right vector (axis to rotate around for pitch)
        let right = Vector3.cross(f, this.up);
        right.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(
            angle,
            right.elements[0],
            right.elements[1],
            right.elements[2]
        );

        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);

        this.updateView();
    }

    //updTate
    updateView() 
    {
        this.viewMat.setLookAt(
            this.eye.elements[0],
            this.eye.elements[1],
            this.eye.elements[2],

            this.at.elements[0],
            this.at.elements[1],
            this.at.elements[2],

            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );
    }
}